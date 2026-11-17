/* =========================================================
   MYL · 拾迹寻宝 引擎层（真实 WebAR 寻宝）
   
   核心职责：
   1. Storage : 印记 / 收集进度 / 解锁状态 → localStorage
   2. PlotPlayer : 剧情播放器（对话气泡 + 语音合成）
   3. HuntEngine : 寻宝引擎（与 Three.js 场景交互）
   
   与 ar-viewer.html 的交互：
   - huntEngine.bind(arScene)   绑定 Three.js 场景
   - huntEngine.start(poiStory)  开始游戏（渲染 3D 线索物体 + 播放剧情）
   - huntEngine.animate(delta)   每帧调，检测线索 proximity + 触发彩蛋
   
   ========================================================= */

/* ============ 印记存储 ============ */
window.HuntStorage = {
  LS_STAMPS: 'myl_hunt_stamps',
  LS_PROGRESS: 'myl_hunt_progress',

  getStamps() {
    try { return JSON.parse(localStorage.getItem(this.LS_STAMPS) || '[]'); }
    catch(e) { return []; }
  },
  addStamp(stamp) {
    var arr = this.getStamps();
    if (arr.indexOf(stamp.id) < 0) arr.push(stamp.id);
    localStorage.setItem(this.LS_STAMPS, JSON.stringify(arr));
    return arr;
  },
  hasStamp(id) { return this.getStamps().indexOf(id) >= 0; },
  getProgress(poiId) {
    try { return JSON.parse(localStorage.getItem(this.LS_PROGRESS + '_' + poiId) || 'null'); }
    catch(e) { return null; }
  },
  setProgress(poiId, data) {
    localStorage.setItem(this.LS_PROGRESS + '_' + poiId, JSON.stringify(data));
  },
  isPostersUnlocked() {
    var stamps = this.getStamps();
    var groups = window.POSTER_GROUPS || [];
    return groups.filter(function(g) {
      return g.required.every(function(r) { return stamps.indexOf(r) >= 0; });
    });
  }
};

/* ============ 剧情播放器（原神式对话气泡） ============ */
window.PlotPlayer = function(container) {
  this.container = container;
  this.queue = [];
  this.playing = false;
  this.currentSpeaker = null;
  this.currentAvatar = null;
  this.onEnd = null;
  this.voiceEnabled = true;
};

window.PlotPlayer.prototype = {
  /* 播放一组剧情 */
  play(plotArr, opts) {
    var self = this;
    opts = opts || {};
    this.onEnd = opts.onEnd || null;
    this.queue = (plotArr || []).slice().sort(function(a,b){ return (a.delay||0) - (b.delay||0); });
    this.playing = true;
    this._tick();
  },

  _tick() {
    var self = this;
    if (!this.playing) return;
    if (!this.queue.length) { this.playing = false; if (this.onEnd) this.onEnd(); return; }
    var next = this.queue.shift();
    if (next.delay) {
      setTimeout(function(){ self._showBubble(next, function(){ self._tick(); }); }, next.delay);
    } else {
      self._showBubble(next, function(){ self._tick(); });
    }
  },

  _showBubble(node, done) {
    if (!this.container) { done && done(); return; }
    var el = document.createElement('div');
    el.className = 'hp-bubble';
    el.innerHTML =
      '<div class="hp-avatar">' + (node.avatar || '📜') + '</div>' +
      '<div class="hp-content">' +
        '<div class="hp-speaker">' + (node.speaker || '旁白') + '</div>' +
        '<div class="hp-text">' + (node.text || '') + '</div>' +
      '</div>' +
      (node.hint ? '<div class="hp-hint">💡 ' + node.hint + '</div>' : '');
    this.container.innerHTML = '';
    this.container.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('hp-in'); });

    // 语音合成
    if (this.voiceEnabled && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(node.text);
        u.lang = 'zh-CN'; u.rate = 0.9; u.pitch = 1.0;
        window.speechSynthesis.speak(u);
      } catch(e){}
    }

    var dur = Math.max(2500, (node.text || '').length * 150 + (node.delay || 0));
    if (node.hint) dur += 500;
    setTimeout(done, Math.min(dur, 15000));
  },

  stop() {
    this.playing = false;
    this.queue = [];
    try { window.speechSynthesis.cancel(); } catch(e){}
    if (this.container) this.container.innerHTML = '';
  }
};

/* ============ 寻宝引擎（与 Three.js 场景交互） ============ */
window.HuntEngine = function() {
  this.poi = null;            // 当前 POI_STORY 对象
  this.scene = null;          // Three.js scene 引用
  this._markerGroup = null;   // MindAR anchor 挂的 group
  this._artifacts = [];       // [{mesh, artifact, found, floatPhase}]
  this._particles = [];       // 发现时的粒子特效
  this._plot = null;          // PlotPlayer 实例
  this._hoverInfo = null;     // 左下角提示框
  this._progress = null;      // 当前景点进度缓存
  this._unlockedEggs = [];    // 已解锁彩蛋列表
  this._stampAwarded = false;
  this._listener = null;      // 自定义事件派发
};

window.HuntEngine.prototype = {
  /* 绑定 Three.js scene */
  bindScene(threeScene, plotContainer, hoverInfoEl) {
    this.scene = threeScene;
    this._plot = new PlotPlayer(plotContainer);
    this._hoverInfo = hoverInfoEl;
  },

  /* 绑定 MindAR anchor group（识别图出现时调用） */
  bindMarkerGroup(group) {
    this._markerGroup = group;
    // 给 marker 加坐标系转换（编辑器地面XY → MindAR平面）
    // group.rotation.x = -Math.PI / 2;
    // group.rotation.z = Math.PI;
  },

  /* 开始寻宝 */
  start(poiStory) {
    var self = this;
    this.poi = poiStory;
    this._artifacts = [];
    this._particles = [];
    this._unlockedEggs = [];
    this._stampAwarded = false;

    // 加载已有进度
    var saved = window.HuntStorage.getProgress(poiStory.id);
    if (saved && saved.found) {
      this._artifacts = (poiStory.artifacts || []).map(function(a) {
        return { artifact: a, found: saved.found.indexOf(a.id) >= 0 };
      });
    } else {
      this._artifacts = (poiStory.artifacts || []).map(function(a) {
        return { artifact: a, found: false };
      });
    }

    // 渲染 3D 线索物体挂到 marker group 上
    this._renderArtifacts();

    // 播放主线剧情
    if (poiStory.plot && poiStory.plot.length) {
      this._plot.play(poiStory.plot, {
        onEnd: function() { self._showHint('剧情结束，开始寻宝！在实景里找漂浮的发光物体'); }
      });
    }

    this._showHint('🎯 ' + poiStory.name + ' 寻宝开始！共 ' + this._artifacts.length + ' 件线索');
  },

  /* 渲染所有线索物体 */
  _renderArtifacts() {
    var self = this;
    if (!this.scene || !this._markerGroup || !window.THREE) return;

    var MODELS = window.ARTIFACT_MODELS || {};

    this._artifacts.forEach(function(entry) {
      if (entry.found) return;
      var a = entry.artifact;

      var mesh;
      var modelKey = a.model;
      var modelFn = MODELS[modelKey];

      if (typeof modelFn === 'function') {
        var pair = modelFn(window.THREE);
        mesh = new window.THREE.Mesh(pair[0], pair[1]);
      } else if (typeof modelFn === 'object' && modelFn.url) {
        // GLB 模型（异步加载）
        mesh = new window.THREE.Mesh(
          new window.THREE.BoxGeometry(0.1, 0.1, 0.1),
          new window.THREE.MeshStandardMaterial({ color: 0xffd700 })
        );
        console.warn('GLB 模型未实现，用占位符：' + modelKey);
      } else {
        mesh = new window.THREE.Mesh(
          new window.THREE.SphereGeometry(0.04, 16, 12),
          new window.THREE.MeshStandardMaterial({ color: 0xffff00, emissive: 0xffaa00, emissiveIntensity: 0.6 })
        );
      }

      mesh.position.set(a.position[0], a.position[1], a.position[2]);
      mesh.userData = { artifactId: a.id, type: 'artifact', entry: entry };

      // 发光光环
      var ringGeo = new window.THREE.RingGeometry(0.045, 0.055, 24);
      var ringMat = new window.THREE.MeshBasicMaterial({ color: 0xffff00, side: window.THREE.DoubleSide, transparent: true, opacity: 0.7 });
      var ring = new window.THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      mesh.add(ring);

      // 漂浮光柱（点光源）
      var light = new window.THREE.PointLight(0xffaa00, 0.8, 1.5);
      light.position.set(0, 0.15, 0);
      mesh.add(light);

      self._markerGroup.add(mesh);
      entry.mesh = mesh;
      entry.ring = ring;
      entry.light = light;
      entry.floatPhase = Math.random() * Math.PI * 2;
    });
  },

  /* 每帧动画 + proximity 检测（找到全部线索才算通关） */
  animate(delta, camera) {
    var self = this;
    if (!this._markerGroup) return;

    var THREE = window.THREE;
    var allFound = this._artifacts.every(function(e){ return e.found; });
    var foundCount = this._artifacts.filter(function(e){ return e.found; }).length;

    this._artifacts.forEach(function(entry, i) {
      if (!entry.mesh) return;

      if (entry.found) {
        // 已找到：缩小淡出
        entry.mesh.scale.setScalar(Math.max(0.001, (entry.mesh.scale.x || 1) - delta * 1.5));
        return;
      }

      // 漂浮动画
      entry.floatPhase += delta * 3;
      entry.mesh.position.y = entry.artifact.position[1] + Math.sin(entry.floatPhase) * 0.03;
      entry.mesh.rotation.y += delta * 1.5;
      if (entry.ring) entry.ring.rotation.z += delta * 2;

      // proximity 检测：玩家相机距离 < 0.3m 就算找到
      if (camera) {
        var worldPos = new THREE.Vector3();
        entry.mesh.getWorldPosition(worldPos);
        var camPos = camera.position;
        var dx = worldPos.x - camPos.x, dy = worldPos.y - camPos.y, dz = worldPos.z - camPos.z;
        var dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

        if (dist < 0.3) {
          self._foundArtifact(entry);
        }
      }
    });

    // 全部找到 → 发印记
    if (!allFound && foundCount === this._artifacts.length && !this._stampAwarded) {
      this._awardStamp();
    }
  },

  /* 发现一件线索 */
  _foundArtifact(entry) {
    var self = this;
    var THREE = window.THREE;
    entry.found = true;

    // 粒子特效（从中心飞散的小金色方块）
    var geo = new THREE.BoxGeometry(0.01, 0.01, 0.01);
    var mat = new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xff5500, emissiveIntensity: 1 });
    for (var i = 0; i < 12; i++) {
      var p = new THREE.Mesh(geo, mat);
      entry.mesh.getWorldPosition(p.position);
      var vel = new THREE.Vector3(
        (Math.random()-0.5) * 0.3,
        Math.random() * 0.3,
        (Math.random()-0.5) * 0.3
      );
      self._particles.push({ mesh: p, vel: vel, life: 1.0 });
      self.scene.add(p);
    }

    // 提示
    this._showToast('✨ 发现线索：' + entry.artifact.name);
    this._saveProgress();

    // 检查彩蛋
    var total = this._artifacts.length;
    var foundCount = this._artifacts.filter(function(e){ return e.found; }).length;
    if (this.poi.easterEggs) {
      this.poi.easterEggs.forEach(function(egg) {
        if (self._unlockedEggs.indexOf(egg.id) >= 0) return;
        var triggerFound = false;
        if (egg.trigger === 'found_artifact_' + foundCount) triggerFound = true;
        if (egg.trigger === 'found_all' && foundCount === total) triggerFound = true;
        if (triggerFound) {
          self._unlockedEggs.push(egg.id);
          self._showToast('🎁 彩蛋解锁：' + egg.name, 4000);
          // 彩蛋剧情
          if (egg.plot && self._plot) {
            setTimeout(function(){ self._plot.play(egg.plot); }, 800);
          }
        }
      });
    }
  },

  /* 粒子更新 */
  updateParticles(delta) {
    var THREE = window.THREE;
    for (var i = this._particles.length - 1; i >= 0; i--) {
      var p = this._particles[i];
      p.life -= delta;
      if (p.life <= 0) {
        this.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._particles.splice(i, 1);
      } else {
        p.mesh.position.addScaledVector(p.vel, delta);
        p.vel.y -= delta * 0.5;
        p.mesh.scale.setScalar(p.life);
      }
    }
  },

  /* 全部找到 → 发放印记 + 通关动画 */
  _awardStamp() {
    this._stampAwarded = true;
    var self = this;

    var stamp = this.poi.stamp;
    window.HuntStorage.addStamp(stamp);

    // 通关动画
    this._showToast('🏆 ' + this.poi.name + ' 寻宝完成！', 5000, 'success');

    setTimeout(function() {
      self._showStampModal(stamp);
      self._saveProgress();
    }, 600);
  },

  /* 打印记弹窗 */
  _showStampModal(stamp) {
    var el = document.createElement('div');
    el.className = 'hp-stamp-modal';
    el.innerHTML =
      '<div class="hp-stamp-inner" style="background:' + (stamp.bg || '#333') + '">' +
        '<div class="hp-stamp-icon">' + stamp.icon + '</div>' +
        '<div class="hp-stamp-title">' + stamp.name + '</div>' +
        '<div class="hp-stamp-desc">' + stamp.desc + '</div>' +
        '<button class="hp-stamp-close">收下</button>' +
      '</div>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('hp-in'); });
    el.querySelector('.hp-stamp-close').onclick = function() {
      el.classList.remove('hp-in');
      setTimeout(function(){ el.remove(); }, 300);
    };
  },

  _saveProgress() {
    if (!this.poi) return;
    var found = this._artifacts.filter(function(e){ return e.found; }).map(function(e){ return e.artifact.id; });
    window.HuntStorage.setProgress(this.poi.id, {
      found: found,
      stamps: window.HuntStorage.getStamps()
    });
  },

  _showToast(text, duration, kind) {
    var self = this;
    var el = document.createElement('div');
    el.className = 'hp-toast' + (kind === 'success' ? ' hp-success' : '');
    el.textContent = text;
    document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('hp-in'); });
    setTimeout(function(){
      el.classList.remove('hp-in');
      setTimeout(function(){ el.remove(); }, 300);
    }, duration || 2000);
  },

  _showHint(text) {
    if (this._hoverInfo) this._hoverInfo.innerHTML = text;
  },

  reset() {
    this._artifacts.forEach(function(e) {
      if (e.mesh && this._markerGroup) this._markerGroup.remove(e.mesh);
    });
    this._artifacts = [];
    this.poi = null;
    if (this._plot) this._plot.stop();
  }
};

/* ============ 兼容旧接口（保留 HuntGame 名字，内部调 HuntEngine） ============ */
window.HuntGame = {
  init: function(opts) {
    return new window.HuntEngine();
  }
};

/* ============ 兼容旧接口 HuntEngine / huntEngine 名字 ============ */
/* window.HuntEngine 已在上方定义 */

/* ============ 兼容旧接口 addStamp / getStamps ============ */
window.addStamp = function(stamp) { return window.HuntStorage.addStamp(stamp); };
window.getStamps = function() { return window.HuntStorage.getStamps(); };
