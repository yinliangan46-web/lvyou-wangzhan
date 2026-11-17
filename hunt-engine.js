/* ============================================================
   拾迹引擎 — 印记存储 / 故事播放 / 寻宝游戏 / AR 调度
   单文件，无外部依赖（AR 模式需 MindAR 从 CDN 加载）
   ============================================================ */

(function () {
    'use strict';

    var LS_STAMPS = 'myl_hunt_stamps_v1';
    var LS_PROGRESS = 'myl_hunt_progress_v1';

    /* ---------- 印记存储 ---------- */
    var Storage = {
        getStamps: function () {
            try { return JSON.parse(localStorage.getItem(LS_STAMPS) || '{}'); }
            catch (e) { return {}; }
        },
        hasStamp: function (poiId) {
            return !!this.getStamps()[poiId];
        },
        addStamp: function (poi) {
            var stamps = this.getStamps();
            stamps[poi.id] = {
                id: poi.id,
                name: poi.name,
                city: poi.city,
                stamp: poi.stamp,
                posterUrl: poi.posterUrl,
                earnedAt: Date.now()
            };
            localStorage.setItem(LS_STAMPS, JSON.stringify(stamps));
            return stamps;
        },
        getProgress: function () {
            try { return JSON.parse(localStorage.getItem(LS_PROGRESS) || '{}'); }
            catch (e) { return {}; }
        },
        setProgress: function (poiId, data) {
            var p = this.getProgress();
            p[poiId] = data;
            localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
        },
        reset: function (poiId) {
            var p = this.getProgress();
            delete p[poiId];
            localStorage.setItem(LS_PROGRESS, JSON.stringify(p));
        },
        totalCount: function () { return Object.keys(this.getStamps()).length; }
    };

    /* ---------- 海报解锁 ---------- */
    function checkPosters() {
        var stamps = Storage.getStamps();
        var posters = [];
        (window.AR_POSTERS || []).forEach(function (poster) {
            var got = (poster.required || []).filter(function (id) { return stamps[id]; });
            posters.push({
                id: poster.id,
                title: poster.title,
                subtitle: poster.subtitle,
                bg: poster.bg,
                caption: poster.caption,
                total: (poster.required || []).length,
                got: got.length,
                unlocked: got.length >= (poster.required || []).length,
                required: poster.required
            });
        });
        return posters;
    }

    /* ---------- 故事播放器 ---------- */
    function StoryPlayer(container, poi, mode) {
        this.el = container;
        this.poi = poi;
        this.mode = mode || 'main'; // 'main' | 'egg'
        this.segments = poi.storyMain;
        if (this.mode === 'egg') this.segments = poi.storyEgg;
        this.cur = -1;
        this.timer = null;
        this._onFinish = null;
        this._onChange = null;
    }
    StoryPlayer.prototype.play = function () {
        var self = this;
        this.stop();
        this.cur = -1;
        this._render();
        this._next();
    };
    StoryPlayer.prototype.stop = function () {
        if (this.timer) clearTimeout(this.timer);
        this.timer = null;
    };
    StoryPlayer.prototype._next = function () {
        this.cur++;
        if (this.cur >= this.segments.length) {
            this._render();
            if (this._onFinish) this._onFinish(this.mode);
            return;
        }
        this._render();
        var seg = this.segments[this.cur];
        var dur = seg.duration || 3000;
        this.timer = setTimeout(this._next.bind(this), dur);
        // 同时播放语音（如果浏览器支持）
        this._speak(seg.text);
        if (this._onChange) this._onChange(this.cur, seg);
    };
    StoryPlayer.prototype._render = function () {
        if (!this.el) return;
        var html = '<div class="ar-story-player">';
        html += '<div class="ar-story-title">' + esc(this.poi.name) + ' · ' + (this.mode === 'egg' ? '隐藏彩蛋' : '主线故事') + '</div>';
        html += '<div class="ar-story-list">';
        this.segments.forEach(function (s, i) {
            var cls = i < this.cur ? 'ar-story-done' : (i === this.cur ? 'ar-story-active' : 'ar-story-pending');
            html += '<div class="' + cls + '" data-idx="' + i + '"><span class="ar-dot"></span>' + esc(s.text) + '</div>';
        }.bind(this));
        html += '</div></div>';
        this.el.innerHTML = html;
    };
    StoryPlayer.prototype._speak = function (text) {
        if (!('speechSynthesis' in window)) return;
        try {
            window.speechSynthesis.cancel();
            var u = new SpeechSynthesisUtterance(text);
            u.lang = 'zh-CN'; u.rate = 0.9; u.pitch = 1;
            window.speechSynthesis.speak(u);
        } catch (e) { /* 忽略语音失败 */ }
    };

    /* ---------- 寻宝游戏 ---------- */
    function HuntGame(poi, opts) {
        this.poi = poi;
        this.opts = opts || {};
        this.onComplete = opts.onComplete || function () {};
        this.onStamp = opts.onStamp || function () {};
        this.el = null;
        this.state = Storage.getProgress()[poi.id] || {
            foundMarkers: [],      // 已找到的标记 id
            quizAnswers: [],        // 答题情况
            completed: false
        };
    }

    HuntGame.prototype.render = function (container) {
        this.el = container;
        var h = this.poi.hunt;
        var markers = h.markers || [];
        var quizzes = h.quizzes || [];

        var html = '<div class="ar-hunt">';
        html += '<div class="ar-hunt-header"><b>🔍 拾迹寻宝</b> <small>集齐全部线索，解锁「' + esc(this.poi.stamp.name) + '」印记</small></div>';

        // 标记线索区
        html += '<div class="ar-markers">';
        html += '<div class="ar-section-title">① 找到这些线索</div>';
        html += '<div class="ar-marker-list">';
        markers.forEach(function (m, i) {
            var found = this.state.foundMarkers.indexOf(m.id) >= 0;
            html += '<div class="ar-marker' + (found ? ' found' : '') + '" data-mid="' + m.id + '">';
            html += '<div class="ar-marker-icon">' + (found ? '✅' : '📍') + '</div>';
            html += '<div class="ar-marker-body">';
            html += '<div class="ar-marker-name">线索 ' + (i + 1) + '</div>';
            html += '<div class="ar-marker-hint">' + esc(m.hint) + '</div>';
            if (!found) {
                html += '<button class="ar-find-btn" data-mid="' + m.id + '">我找到了！</button>';
            } else {
                html += '<div class="ar-found-ans">答案：<b>' + esc(m.answer) + '</b></div>';
            }
            html += '</div></div>';
        }.bind(this));
        html += '</div></div>';

        // 答题区
        if (markers.length === 0 || this.state.foundMarkers.length >= markers.length) {
            html += '<div class="ar-quiz">';
            html += '<div class="ar-section-title">② 趣味考题</div>';
            quizzes.forEach(function (q, qi) {
                var ans = this.state.quizAnswers[qi];
                var locked = ans === undefined;
                var correct = ans !== undefined && ans.correct;
                html += '<div class="ar-quiz-item' + (correct ? ' correct' : (ans !== undefined ? ' wrong' : '')) + '">';
                html += '<div class="ar-q-num">Q' + (qi + 1) + '</div>';
                html += '<div class="ar-q-text">' + esc(q.q) + '</div>';
                if (ans !== undefined) {
                    html += '<div class="ar-q-result">' + (correct ? '✅ 答对了' : '❌ 答错了（可以再试）') + '</div>';
                }
                if (ans === undefined) {
                    html += '<div class="ar-q-opts">';
                    q.options.forEach(function (opt, oi) {
                        html += '<button class="ar-q-opt" data-qi="' + qi + '" data-oi="' + oi + '">' + esc(opt) + '</button>';
                    });
                    html += '</div>';
                } else {
                    html += '<div class="ar-q-retry"><button class="ar-retry-btn" data-qi="' + qi + '">重新作答</button></div>';
                }
                html += '</div>';
            }.bind(this));
            html += '</div>';
        } else {
            html += '<div class="ar-hint">先去找到全部 ' + markers.length + ' 个线索标记，考题才会解锁 →</div>';
        }

        // 印记发放区
        if (this._allMarkersFound() && this._allQuizzesCorrect()) {
            var already = Storage.hasStamp(this.poi.id);
            if (!already) {
                html += '<div class="ar-stamp-award">';
                html += '<div class="ar-stamp-big">' + this.poi.stamp.emoji + '</div>';
                html += '<div class="ar-stamp-name">「' + esc(this.poi.stamp.name) + '」已发放</div>';
                html += '<div class="ar-stamp-sub">恭喜！你解锁了这个景点的专属印记</div>';
                html += '<button class="ar-open-album">去拾迹集册看看 →</button>';
                html += '</div>';
            } else {
                html += '<div class="ar-stamp-already">🏆 你已经拿到「' + esc(this.poi.stamp.name) + '」了！</div>';
            }
            this.state.completed = true;
        }

        html += '</div>';
        this.el.innerHTML = html;
        this._bind();
    };

    HuntGame.prototype._bind = function () {
        var self = this;
        this.el.querySelectorAll('.ar-find-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var mid = btn.getAttribute('data-mid');
                self._markFound(mid);
            });
        });
        this.el.querySelectorAll('.ar-q-opt').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var qi = parseInt(btn.getAttribute('data-qi'), 10);
                var oi = parseInt(btn.getAttribute('data-oi'), 10);
                self._answer(qi, oi);
            });
        });
        this.el.querySelectorAll('.ar-retry-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var qi = parseInt(btn.getAttribute('data-qi'), 10);
                self._retry(qi);
            });
        });
        var albumBtn = this.el.querySelector('.ar-open-album');
        if (albumBtn) {
            albumBtn.addEventListener('click', function () {
                window.open('album.html', '_blank');
            });
        }
    };

    HuntGame.prototype._markFound = function (mid) {
        if (this.state.foundMarkers.indexOf(mid) >= 0) return;
        this.state.foundMarkers.push(mid);
        Storage.setProgress(this.poi.id, this.state);
        this.render(this.el);
        this._checkAndAward();
    };

    HuntGame.prototype._answer = function (qi, oi) {
        var correct = oi === this.poi.hunt.quizzes[qi].answer;
        this.state.quizAnswers[qi] = { chosen: oi, correct: correct };
        Storage.setProgress(this.poi.id, this.state);
        this.render(this.el);
        this._checkAndAward();
    };

    HuntGame.prototype._retry = function (qi) {
        delete this.state.quizAnswers[qi];
        Storage.setProgress(this.poi.id, this.state);
        this.render(this.el);
    };

    HuntGame.prototype._allMarkersFound = function () {
        var ms = this.poi.hunt.markers || [];
        if (ms.length === 0) return true;
        return ms.every(function (m) { return this.state.foundMarkers.indexOf(m.id) >= 0; }.bind(this));
    };

    HuntGame.prototype._allQuizzesCorrect = function () {
        var qs = this.poi.hunt.quizzes || [];
        if (qs.length === 0) return true;
        return qs.every(function (_, i) {
            var a = this.state.quizAnswers[i];
            return a && a.correct;
        }.bind(this));
    };

    HuntGame.prototype._checkAndAward = function () {
        if (this._allMarkersFound() && this._allQuizzesCorrect() && !Storage.hasStamp(this.poi.id)) {
            Storage.addStamp(this.poi);
            this.onStamp(this.poi);
            this.render(this.el);
        }
    };

    /* ---------- AR 调度器 ---------- */
    var AR = {
        isSupported: function () {
            if (!navigator.mediaDevices) return false;
            return true; // 支持 getUserMedia 就行，MindAR 加载失败会优雅降级
        },
        launchMode: function (poi, el) {
            /* 返回 'ar' / 'interactive' / 'story' 三种模式
               - ar: 有 markerUrl + 支持摄像头 → MindAR 增强现实
               - interactive: 无 markerUrl 或摄像头不可用 → 页面交互式故事 + 寻宝
               - story: 纯故事模式 */
            if (poi.markerUrl && this.isSupported()) return 'ar';
            return 'interactive';
        }
    };

    /* ---------- 录屏 ---------- */
    function startScreenCapture(videoEl, onStop) {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
            alert('当前浏览器不支持屏幕录制，建议用 Chrome / Edge 电脑端体验。');
            return null;
        }
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            .then(function (stream) {
                // 把摄像头画面 + 屏幕画面混流可录制
                // 简单方案：直接录屏幕
                var recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
                var chunks = [];
                recorder.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
                recorder.onstop = function () {
                    var blob = new Blob(chunks, { type: 'video/webm' });
                    var url = URL.createObjectURL(blob);
                    var a = document.createElement('a');
                    a.href = url;
                    a.download = 'myl-ar-' + Date.now() + '.webm';
                    document.body.appendChild(a);
                    a.click(); a.remove();
                    if (onStop) onStop();
                };
                recorder.start();
                // 用户停止共享 → 自动停录
                stream.getVideoTracks()[0].addEventListener('ended', function () {
                    if (recorder.state !== 'inactive') recorder.stop();
                });
                return recorder;
            })
            .catch(function (e) { alert('录屏取消或失败：' + e.message); });
        return null;
    }

    /* ---------- 工具 ---------- */
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
        });
    }

    /* ---------- 导出 ---------- */
    window.MYLHunt = {
        Storage: Storage,
        checkPosters: checkPosters,
        StoryPlayer: StoryPlayer,
        HuntGame: HuntGame,
        AR: AR,
        startScreenCapture: startScreenCapture,
        esc: esc
    };

})();
