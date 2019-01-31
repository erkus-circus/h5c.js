/***********************
 * HTML5 Canvas Library
 * With Erklib
 * Eric Diskin
 * 2018 - 2019
 * V0.3.0 Pre Alpha
 * Requires ES6+
 ***********************/


//Canvas

(function (window, document) {

    "use strict";
    
    const [mmove] = ['mousemove'];
    
    function Player(x, y, opts, name) {
        this.flags = $.extend(true, {
            hidden: false,
            collision: true,
            bounce: 0,
            reverseYOnCOllison: true,
            reverseXOnCOllison: true,
            angle: 0,
            onCollide: function () {  },
            collisionType: 'box',
            xSpeed: 0,// Remove!
            ySpeed: 0,// Remove!
            height: 10,
            image: '',
            color: '#000',
            width: 10,
            keysDown: [],
            collidesWith: [],
            autoMove: false,
            keys: true,
            speed: 0,
            leftCode: 65,
            accelSpeed: 0,
            maxYSpeed: 100,
            upCode: 87,
            downCode: 83,
            rightCode: 68,
        }, opts); // rendering opts and updating opts


        this.xx = x;
        this.yy = y;
        this.name = name

        this.keyPress = function (e) {
            var kc = e.keyCode || e.wich;

            if (this.flags.keysDown.indexOf(kc) >= 0) {
                return;
            }
            this.flags.keysDown.push(kc)
        }

        this.addCollider = function (arr) {
            $.merge(this.flags.collidesWith, arr)
        }

        this.keyUp = function (e) {
            this.flags.keysDown.splice(this.flags.keysDown.indexOf(e.keyCode),1)
        }

        this.update = function (deltaTime, frameo) {
            var canMove = true;
            for (let i = 0; i < this.flags.collidesWith.length; i++) { // collision
                const e = this.flags.collidesWith[i];

                var BC = pointInside([[this.xx, this.yy], [this.xx + this.flags.width, this.yy + this.flags.height]], [e.xx + e.flags.width, e.yy]),
                    TC = pointInside([[this.xx, this.yy], [this.xx + this.flags.width, this.yy + this.flags.height]], [e.xx + e.flags.width, e.yy + e.flags.height]),
                    RC = pointInside([[this.xx, this.yy], [this.xx + this.flags.width, this.yy + this.flags.height]], [e.xx, e.yy + e.flags.height]),
                    LC = pointInside([[this.xx, this.yy], [this.xx + this.flags.width, this.yy + this.flags.height]], [e.xx, e.yy]);
                
                    
                    
                    if (TC||BC||RC||LC) { // do for each point on each obj so COLDECT
                        console.log('TC:',TC,'BC:',BC,'RC:',RC,'LC',LC);
                        canMove = false;

                    this.flags.onCollide(this)
                    e.flags.onCollide(e)
                        
                    this.flags.ySpeed *= this.flags.bounce;
                    e.flags.ySpeed *= e.flags.bounce;
                    
                    if (this.flags.reverseXOnCOllison) {
                        this.flags.xSpeed = -this.flags.xSpeed
                    } 
                    if (this.flags.reverseYOnCOllison) {
                        this.flags.ySpeed = -this.flags.ySpeed
                    }
                    if (e.flags.reverseYOnCOllison) {
                        e.flags.ySpeed = -e.flags.ySpeed
                    }
                    if (e.flags.reverseXOnCOllison) {
                        e.flags.xSpeed = -e.flags.xSpeed
                    }
                }
            }

            if (this.flags.keys && canMove) {
                for (let i = 0; i < this.flags.keysDown.length; i++) {
                    const kc = this.flags.keysDown[i];

                    this.xx += this.flags.xSpeed * deltaTime;
                    this.yy += this.flags.ySpeed * deltaTime;

                    switch (kc) {
                        case this.flags.upCode:
                            this.yy -= this.flags.speed * deltaTime;
                            break;

                        case this.flags.downCode:
                            this.yy += this.flags.speed * deltaTime;
                            break;

                        case this.flags.leftCode:
                            this.xx -= this.flags.speed * deltaTime;
                            break;

                        case this.flags.rightCode:
                            this.xx += this.flags.speed * deltaTime;
                            break;
                    }
                }
            }
            if (this.flags.autoMove && canMove) {
                this.yy += (this.flags.speed + this.flags.ySpeed + ++this.flags.accelSpeed) * deltaTime;
                this.xx += (this.flags.speed + this.flags.xSpeed) * deltaTime;
            }
        }

        this.render = function (framno, c) {
            c.beginPath()
            c.fillStyle = this.flags.color;
            c.fillRect(this.xx, this.yy, this.flags.width, this.flags.height);
            c.closePath()
        }
    }

    function Canvas(canv, FPS = 60, callback=function () {  }) {
        if (!canv[0].getContext) {
            return;
        }

        this.style = function (v) {
            this.c.fillStyle = v
        }

        this.frameno = 0

        this.renderAll = function () {
            for (let i = 0; i < this.world.length; i++) {
                this.world[i].render(this.frameno, this.c)
            }
        }

        this.updateAll = function (d) {
            for (let i = 0; i < this.world.length; i++) {
                this.world[i].update(d, this.frameno);
            }
        }

        this.doAll = function (a,b) {
            for (let i = 0; i < this.world.length; i++) {
                this.world[i][a](b);
            }
        }

        this.canv = canv[0];
        this.callback = callback;
        this.FPS = FPS;
        this.width = canv.width()
        this.height = canv.height()
        this.ltc = undefined;
        this.c = canv[0].getContext('2d');
        this.ctx = this.c;

        
        this.beginEngine = function () {

            var t = this;

            window.onkeydown = function (e) {
                e.preventDefault()
                t.doAll('keyPress',e);
            };
            window.onkeyup = function (e) {
                e.preventDefault()
                t.doAll('keyUp',e);
            }

            setInterval(() => {
                this.frameno++;
                var fps;
                this.c.clearRect(0,0,this.canv.width, this.canv.height)

                if (!this.ltc) {
                    this.ltc = Date.now();
                    fps = 0;
                    return;
                }
                
                var deltaTime = (Date.now() - this.ltc) / 1000;
                
                this.ltc = Date.now();
                fps = 1 / deltaTime;
                
                this.callback(deltaTime, fps);

                this.updateAll(deltaTime);
                this.renderAll();
            }, this.FPS);
        }
        
        this.rect = function (x, y, x2, y2) {
            this.c.rect(x, y, x2 - x, y2 - y);
        }

        this.fillRect = function (x1, y1, x2, y2) {
            this.rect(x1, y1, x2 - x1, y2 - y1)
            this.fill()
        }

        this.getMousePos = function (e) {
            var rt = this.canv.getBoundingClientRect();
            return [
                e.clientX - rt.left,
                e.clientY - rt.top
            ];
        }

        this.fill = function () { this.c.fill(); };

        this.stroke = function () { this.c.stroke(); };

        this.line = function (x1, y1, x2, y2) {
            this.c.moveTo(x1, y1);
            this.c.lineTo(x2, y2);
        }

        this.compos = function (v) { // tut: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
            this.c.globalCompositeOperation = v;
        }

        
        this.world = [];
        
        /**
         * @param points [ [X,Y], [X,Y], [X,Y] ]
         * @description begins a path and draws the shape. the last POS does not have to connect
         */
        this.shape = function (points) {
            this.c.beginPath();
            var a = points.splice(0, 2)
            this.c.moveTo(a[0], a[1])

            for (let i = 0; i < points.length; i++) {
                const [x, y] = points[i];
                this.c.lineTo(x, y);
            }

            this.c.lineTo(a[0], a[1])
            this.c.closePath()
        };
    }

    function pointInside(poses, pos) {

        var ins = false,
            max_x = 0,
            max_y = 0,
            min_x = 0,
            min_y = 0;

        for (let i = 0; i < poses.length; i++) {
            const p = poses[i];
            let [x, y] = p
            // get maxes
            if (max_x < x) {
                max_x = x;
                min_x = x;
            }

            if (max_y < y) {
                min_y = y;
                max_y = y;
            }
        }

        for (let i = 0; i < poses.length; i++) {
            // Get mins
            const p = poses[i];
            let [x, y] = p;
            if (x < min_x) {
                min_x = x;
            }
            if (y < min_y) {
                min_y = y;
            }
        }
        let [x, y] = pos

        
        
        if (x > min_x && y < max_y && x < max_x && y > min_y) {
            ins = true;
        }

        return ins;
    }

    window.Canvas = Canvas;
    window.Player = Player;

})(window, window.document);