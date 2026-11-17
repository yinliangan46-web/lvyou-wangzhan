/**
 * TouchControls — 单指拖拽平移 / 双指旋转 + 缩放
 * 轻量 Three.js 控件，专为 AR 空间浏览设计
 *
 * 使用：
 *   var controls = new TouchControls(canvasEl, camera, targetGroup);
 *   // 在 render loop 里 controls.update()
 */
(function(global) {
  'use strict';

  function TouchControls(domElement, camera, target) {
    this.dom = domElement;
    this.camera = camera;
    this.target = target;           // 被控制的 3D 组（平移/旋转/缩放它）

    // 当前状态
    this.pan = { x: 0, y: 0 };      // 屏幕像素单位
    this.rot = { x: 0, y: 0 };      // 弧度
    this.scale = 1;                  // 缩放倍率

    // 初始值（reset 用）
    this._initialPan = { x: 0, y: 0 };
    this._initialRot = { x: 0, y: 0 };
    this._initialScale = 1;

    // 内部
    this._pointers = new Map();      // pointerId → {x, y}
    this._lastPinchDist = 0;
    this._lastRotAngle = 0;
    this._lastTwoPointerCenter = null;

    this.onAdd();
  }

  TouchControls.prototype = {
    onAdd() {
      var el = this.dom;
      // Pointer Events 兼容所有平台（iOS Safari 13+ / Android / Chrome）
      el.addEventListener('pointerdown', this._onDown.bind(this));
      el.addEventListener('pointermove', this._onMove.bind(this));
      el.addEventListener('pointerup', this._onUp.bind(this));
      el.addEventListener('pointercancel', this._onUp.bind(this));
      el.addEventListener('pointerleave', this._onUp.bind(this));
      this._applyPointerStyle(true);
    },

    _applyPointerStyle(add) {
      var el = this.dom;
      if (add) {
        el.style.touchAction = 'none';  // 禁用浏览器原生滚动
        el.style.cursor = 'grab';
      } else {
        el.style.touchAction = '';
        el.style.cursor = '';
      }
    },

    dispose() {
      var el = this.dom;
      el.removeEventListener('pointerdown', this._onDown);
      el.removeEventListener('pointermove', this._onMove);
      el.removeEventListener('pointerup', this._onUp);
      el.removeEventListener('pointercancel', this._onUp);
      el.removeEventListener('pointerleave', this._onUp);
      this._applyPointerStyle(false);
    },

    reset() {
      this.pan = { ...this._initialPan };
      this.rot = { ...this._initialRot };
      this.scale = this._initialScale;
    },

    _onDown(e) {
      e.preventDefault();
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      // 记录初始状态
      if (this._pointers.size === 1) {
        this._lastPinchDist = 0;
        this._lastRotAngle = 0;
        this._lastTwoPointerCenter = null;
      } else if (this._pointers.size === 2) {
        var pts = this._pointersArr();
        this._lastPinchDist = this._dist(pts[0], pts[1]);
        this._lastRotAngle = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x);
        this._lastTwoPointerCenter = this._center(pts);
      }
    },

    _onMove(e) {
      if (!this._pointers.has(e.pointerId)) return;
      e.preventDefault();
      this._pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (this._pointers.size === 1) {
        // 单指 → 平移（pan）
        var old = this._lastTwoPointerCenter || this._singleCenter || { x: e.clientX, y: e.clientY };
        var dx = e.clientX - old.x;
        var dy = e.clientY - old.y;
        // 把屏幕像素位移转成 3D 世界位移
        // 简化：按缩放比例反比
        this.pan.x += dx * 0.005 / this.scale;
        this.pan.y -= dy * 0.005 / this.scale;  // Y 轴反转
        this._singleCenter = { x: e.clientX, y: e.clientY };

      } else if (this._pointers.size === 2) {
        var pts = this._pointersArr();
        var a = pts[0], b = pts[1];
        var curDist = this._dist(a, b);
        var curAngle = Math.atan2(b.y - a.y, b.x - a.x);
        var curCenter = this._center(pts);

        // 双指间距变化 → 缩放
        if (this._lastPinchDist > 0) {
          var ratio = curDist / this._lastPinchDist;
          this.scale *= ratio;
          this.scale = Math.max(0.3, Math.min(5, this.scale));
        }

        // 双指角度变化 → 旋转（绕 Y 轴）
        if (this._lastRotAngle !== 0) {
          var deltaAngle = curAngle - this._lastRotAngle;
          this.rot.y += deltaAngle;
        }

        // 双指整体位移 → 平移
        if (this._lastTwoPointerCenter) {
          var dx2 = curCenter.x - this._lastTwoPointerCenter.x;
          var dy2 = curCenter.y - this._lastTwoPointerCenter.y;
          this.pan.x += dx2 * 0.004 / this.scale;
          this.pan.y -= dy2 * 0.004 / this.scale;
        }

        this._lastPinchDist = curDist;
        this._lastRotAngle = curAngle;
        this._lastTwoPointerCenter = curCenter;
      }
    },

    _onUp(e) {
      this._pointers.delete(e.pointerId);
      if (this._pointers.size < 2) {
        this._lastPinchDist = 0;
        this._lastRotAngle = 0;
        this._lastTwoPointerCenter = null;
      }
      if (this._pointers.size === 1) {
        this._singleCenter = this._pointersArr()[0];
      } else {
        this._singleCenter = null;
      }
    },

    _pointersArr() {
      return Array.from(this._pointers.values());
    },

    _dist(a, b) {
      var dx = a.x - b.x, dy = a.y - b.y;
      return Math.sqrt(dx * dx + dy * dy);
    },

    _center(pts) {
      return { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
    },

    update() {
      if (!this.target) return;
      // 应用变换：先 pan → 再 rot → 最后 scale（顺序很重要）
      this.target.position.set(this.pan.x, this.pan.y, 0);
      this.target.rotation.x = this.rot.x;
      this.target.rotation.y = this.rot.y;
      this.target.scale.setScalar(this.scale);
    }
  };

  global.TouchControls = TouchControls;
})(window);
