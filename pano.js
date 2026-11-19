/* ========== MYL 全景漫游 · 宽幅实景环视 ========== */
/* 无 WebGL 依赖：图片按视口放大后平移浏览，支持拖拽、惯性、缩放、自动环视、全屏 */
(function () {
    'use strict';

    var DATA = window.PANO_DATA || {};
    var instances = [];

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    function has(name) {
        return !!(DATA[name] && DATA[name].src);
    }

    function render(name) {
        var d = DATA[name];
        if (!d) return '';
        return '' +
            '<div class="pn" data-pn="' + esc(name) + '">' +
                '<div class="pn-stage" tabindex="0" role="img" aria-label="' + esc(d.title || name) + ' 实景环视">' +
                    '<img class="pn-img" alt="' + esc(d.title || name) + '" draggable="false" decoding="async" />' +
                    '<div class="pn-loading"><i class="fas fa-circle-notch fa-spin"></i><span>正在加载实景…</span></div>' +
                    '<div class="pn-hint"><i class="fas fa-arrows-left-right"></i> 拖动环视 · 滚轮 / 双指缩放</div>' +
                    '<div class="pn-tools">' +
                        '<button type="button" data-act="zoomout" aria-label="缩小"><i class="fas fa-minus"></i></button>' +
                        '<button type="button" data-act="zoomin" aria-label="放大"><i class="fas fa-plus"></i></button>' +
                        '<button type="button" data-act="auto" aria-label="自动环视" title="自动环视"><i class="fas fa-play"></i></button>' +
                        '<button type="button" data-act="reset" aria-label="回到起点" title="回到起点"><i class="fas fa-rotate-left"></i></button>' +
                        '<button type="button" data-act="full" aria-label="全屏" title="全屏"><i class="fas fa-expand"></i></button>' +
                    '</div>' +
                    '<div class="pn-err"><i class="fas fa-triangle-exclamation"></i><span>实景图暂时加载失败，可稍后重试。</span></div>' +
                '</div>' +
                '<div class="pn-cap">' +
                    '<b>' + esc(d.title || name) + '</b>' +
                    '<span>' + esc(d.tip || '拖动画面即可环视这处景观。') + '</span>' +
                    '<em>宽幅实景环视（非 720° 球面） · 素材：' + esc(d.credit || '公开旅游媒体') + '</em>' +
                '</div>' +
            '</div>';
    }

    function Viewer(root) {
        var name = root.getAttribute('data-pn');
        var d = DATA[name] || {};
        var stage = root.querySelector('.pn-stage');
        var img = root.querySelector('.pn-img');
        var autoBtn = root.querySelector('[data-act="auto"]');
        var fullBtn = root.querySelector('[data-act="full"]');

        var W = 1, H = 1, iw = 0, ih = 0, ratio = 1.5;
        var scale = 1, dispW = 0, dispH = 0, tx = 0, ty = 0;
        var vx = 0, vy = 0, dir = -1;
        var auto = false, autoRaf = 0, inertiaRaf = 0;
        var pointers = {}, pinchBase = 0, pinchScale = 1, lastT = 0;
        var started = false, pending = null;

        function measure() {
            W = stage.clientWidth || 1;
            H = stage.clientHeight || 1;
            if (!iw && img.naturalWidth) { iw = img.naturalWidth; ih = img.naturalHeight; }
            if (!iw) return false;
            ratio = iw / ih;
            return true;
        }

        function baseH() {
            return Math.max(H * 1.01, (W * 1.16) / ratio);
        }

        function clamp() {
            var minX = W - dispW, minY = H - dispH;
            if (tx > 0) tx = 0;
            if (tx < minX) tx = minX;
            if (ty > 0) ty = 0;
            if (ty < minY) ty = minY;
        }

        function paint() {
            img.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
        }

        function size(center) {
            if (!measure()) return;
            dispH = baseH() * scale;
            dispW = dispH * ratio;
            img.style.width = dispW + 'px';
            img.style.height = dispH + 'px';
            if (center) {
                tx = (W - dispW) / 2;
                ty = (H - dispH) / 2;
            }
            clamp();
            paint();
        }

        function setScale(next, px, py) {
            if (!measure()) return;
            next = Math.max(1, Math.min(2.6, next));
            if (Math.abs(next - scale) < 0.001) return;
            var oldH = baseH() * scale, newH = baseH() * next;
            var k = newH / oldH;
            if (px == null) { px = W / 2; py = H / 2; }
            tx = px - (px - tx) * k;
            ty = py - (py - ty) * k;
            scale = next;
            dispH = newH;
            dispW = newH * ratio;
            img.style.width = dispW + 'px';
            img.style.height = dispH + 'px';
            clamp();
            paint();
        }

        function stopAuto() {
            auto = false;
            if (autoRaf) cancelAnimationFrame(autoRaf);
            autoRaf = 0;
            if (autoBtn) {
                autoBtn.classList.remove('on');
                autoBtn.querySelector('i').className = 'fas fa-play';
            }
        }

        function autoTick() {
            if (!auto) return;
            if (dispW <= W + 1) { stopAuto(); return; }
            tx += dir * 0.5;
            var minX = W - dispW;
            if (tx <= minX) { tx = minX; dir = 1; }
            if (tx >= 0) { tx = 0; dir = -1; }
            paint();
            autoRaf = requestAnimationFrame(autoTick);
        }

        function toggleAuto() {
            if (auto) { stopAuto(); return; }
            auto = true;
            if (autoBtn) {
                autoBtn.classList.add('on');
                autoBtn.querySelector('i').className = 'fas fa-pause';
            }
            autoRaf = requestAnimationFrame(autoTick);
        }

        function inertia() {
            inertiaRaf = 0;
            if (Math.abs(vx) < 0.08 && Math.abs(vy) < 0.08) { vx = vy = 0; return; }
            tx += vx; ty += vy;
            vx *= 0.94; vy *= 0.94;
            var bx = tx, by = ty;
            clamp();
            if (tx !== bx) vx = 0;
            if (ty !== by) vy = 0;
            paint();
            inertiaRaf = requestAnimationFrame(inertia);
        }

        function stagePoint(e) {
            var r = stage.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }

        function onDown(e) {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            try { stage.setPointerCapture(e.pointerId); } catch (err) {}
            vx = vy = 0;
            lastT = performance.now();
            if (inertiaRaf) { cancelAnimationFrame(inertiaRaf); inertiaRaf = 0; }
            stage.classList.add('dragging');
            if (Object.keys(pointers).length === 1) stopAuto();
            if (Object.keys(pointers).length === 2) {
                var pts = Object.keys(pointers).map(function (k) { return pointers[k]; });
                pinchBase = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
                pinchScale = scale;
            }
        }

        function onMove(e) {
            var p = pointers[e.pointerId];
            if (!p) return;
            var keys = Object.keys(pointers);
            if (keys.length >= 2) {
                pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
                var pts = keys.map(function (k) { return pointers[k]; });
                var dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
                var mid = stagePoint({ clientX: (pts[0].x + pts[1].x) / 2, clientY: (pts[0].y + pts[1].y) / 2 });
                setScale(pinchScale * (dist / pinchBase), mid.x, mid.y);
                return;
            }
            var dx = e.clientX - p.x;
            var dy = e.clientY - p.y;
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            tx += dx; ty += dy;
            clamp(); paint();
            var now = performance.now();
            var dt = Math.max(16, now - lastT);
            vx = dx * 16 / dt;
            vy = dy * 16 / dt;
            lastT = now;
        }

        function onUp(e) {
            if (!pointers[e.pointerId]) return;
            delete pointers[e.pointerId];
            try { stage.releasePointerCapture(e.pointerId); } catch (err) {}
            if (!Object.keys(pointers).length) {
                stage.classList.remove('dragging');
                if (Math.abs(vx) + Math.abs(vy) > 0.6) inertia();
            }
            if (Object.keys(pointers).length < 2) pinchBase = 0;
        }

        stage.addEventListener('pointerdown', onDown);
        stage.addEventListener('pointermove', onMove);
        stage.addEventListener('pointerup', onUp);
        stage.addEventListener('pointercancel', onUp);

        stage.addEventListener('wheel', function (e) {
            e.preventDefault();
            var p = stagePoint(e);
            setScale(scale * (e.deltaY > 0 ? 0.9 : 1.1), p.x, p.y);
        }, { passive: false });

        stage.addEventListener('dblclick', function (e) {
            var p = stagePoint(e);
            setScale(scale > 1.4 ? 1 : 1.9, p.x, p.y);
        });

        root.addEventListener('click', function (e) {
            var btn = e.target.closest ? e.target.closest('[data-act]') : null;
            if (!btn) return;
            var act = btn.getAttribute('data-act');
            if (act === 'zoomin') setScale(scale * 1.18);
            else if (act === 'zoomout') setScale(scale / 1.18);
            else if (act === 'auto') toggleAuto();
            else if (act === 'reset') { stopAuto(); scale = 1; size(true); }
            else if (act === 'full') toggleFull();
        });

        function syncFullIcon() {
            if (!fullBtn) return;
            var on = document.fullscreenElement === stage || root.classList.contains('pn-fs');
            fullBtn.querySelector('i').className = on ? 'fas fa-compress' : 'fas fa-expand';
        }

        function fallbackFull(on) {
            root.classList.toggle('pn-fs', on);
            document.body.style.overflow = on ? 'hidden' : '';
            setTimeout(function () { size(false); clamp(); paint(); }, 60);
            syncFullIcon();
        }

        function toggleFull() {
            if (document.fullscreenElement) { document.exitFullscreen(); return; }
            if (root.classList.contains('pn-fs')) { fallbackFull(false); return; }
            if (stage.requestFullscreen) {
                stage.requestFullscreen().then(function () { setTimeout(function () { size(false); }, 120); })
                    .catch(function () { fallbackFull(true); });
            } else {
                fallbackFull(true);
            }
            setTimeout(syncFullIcon, 120);
        }

        document.addEventListener('fullscreenchange', function () {
            if (document.fullscreenElement !== stage) {
                setTimeout(function () { size(false); clamp(); paint(); }, 60);
            } else {
                setTimeout(function () { size(false); clamp(); paint(); }, 120);
            }
            syncFullIcon();
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && root.classList.contains('pn-fs')) fallbackFull(false);
            if (document.activeElement !== stage) return;
            if (e.key === 'ArrowLeft') { tx += 60; clamp(); paint(); e.preventDefault(); }
            if (e.key === 'ArrowRight') { tx -= 60; clamp(); paint(); e.preventDefault(); }
        });

        var rzTimer = 0;
        window.addEventListener('resize', function () {
            clearTimeout(rzTimer);
            rzTimer = setTimeout(function () { size(false); clamp(); paint(); }, 120);
        });

        function start() {
            if (started) return;
            started = true;
            img.addEventListener('load', function () {
                root.classList.add('ready');
                size(true);
            });
            img.addEventListener('error', function () {
                root.classList.add('pn-err');
            });
            img.src = d.src || '';
        }

        if ('IntersectionObserver' in window) {
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (en) {
                    if (en.isIntersecting) { io.disconnect(); start(); }
                });
            }, { rootMargin: '320px 0px' });
            io.observe(root);
        } else {
            start();
        }

        return { refresh: function () { size(false); clamp(); paint(); } };
    }

    function mountAll() {
        var nodes = Array.prototype.slice.call(document.querySelectorAll('.pn[data-pn]'));
        nodes.forEach(function (node) {
            if (node.getAttribute('data-mounted')) return;
            node.setAttribute('data-mounted', '1');
            try { instances.push(Viewer(node)); } catch (e) {}
        });
    }

    window.MYL_PANO = { has: has, render: render, mountAll: mountAll };
})();
