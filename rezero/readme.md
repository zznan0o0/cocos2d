# 第一个游戏制作
## 1.创建scene场景
从资源管理器中点击`+`创建`scene`，改名为`game`
### 游戏场景(scene)包括以下内容
    * 场景图像和文字（Sprite，Label）
    * 角色
    * 以组件形式附加在场景节点上的游戏逻辑脚本
## 2.了解canvas
打开场景后，层级管理器中会显示当前场景中的所有节点和他们的层级关系。我们刚刚新建的场景中只有一个名叫Canvas的节点，Canvas可以被称为画布节点或渲染根节点，点击选中Canvas，可以在属性检查器中看到他的属性。

## 3.添加背景
将背景拖到层管理中的`canvas`并设置属性
## 4.添加地面
将地面文件放在`canvas`中的`背景节点`下并设置
## 5.添加主角
将文件拖到`canvas`地面文件下并设置改名为Player       

    需要我们设置为Player(Anchor)锚点,控制角色的位置
##编写Player脚本
创建script文件夹并创建JavaScript脚本重名名为Player

```javascript
properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
    },
```

为Player添加Player脚本并设置属性
##编写跳跃和移动代码
```javascript
// Player.js
    properties: {
        //...
    },

    setJumpAction: function () {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 不断重复
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown));
    },

    onLoad: function () {
        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);
    },
```

    * moveBy(duration, deltaPos, deltaY) returns ActionInterval

    * cc.p(x, y) return Vec2

    * ActionInterval 
    时间间隔动作，这种动作在已定时间内完成，继承 FiniteTimeAction。

    * easing(easeObj ) returns ActionInterval

    * easeCubicActionOut 三次函数缓动退出的动作

    * easeCubicActionIn 是按三次函数缓动进入的动作

    * repeatForever(action) returns ActionInterval
    永远地重复一个动作，有限次数内重复一个动作请使用 repeat 动作。

    * sequence(tempArray) returns ActionInterval
    顺序执行动作，创建的动作将按顺序依次运行

    * runAction(action) return Action
    执行并返回该执行的动作。该节点将会变成动作的目标。
    调用 runAction 时，节点自身处于不激活状态将不会有任何效果。

## 移动控制
```javascript
// Player.js
    setJumpAction: function () {
        //...
    },

    setInputControl: function () {
        var self = this;
        // 添加键盘事件监听
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
            onKeyPressed: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            // 松开按键时，停止向该方向的加速
            onKeyReleased: function(keyCode, event) {
                switch(keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },

    onLoad: function () {
        // 初始化跳跃动作
        this.jumpAction = this.setJumpAction();
        this.node.runAction(this.jumpAction);

        // 加速度方向开关
        this.accLeft = false;
        this.accRight = false;
        // 主角当前水平方向速度
        this.xSpeed = 0;

        // 初始化键盘输入监听
        this.setInputControl();
    },

    update: function (dt) {
        // 根据当前加速度方向每帧更新速度
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        }
        // 限制主角的速度不能超过最大值
        if ( Math.abs(this.xSpeed) > this.maxMoveSpeed ) {
            // if speed reach limit, use max speed with current direction
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        }

        // 根据当前速度更新主角的位置
        this.node.x += this.xSpeed * dt;
    },
```

    * eventManager
    事件管理器，它主要管理事件监听器注册和派发系统事件。 
    原始设计中，它支持鼠标，触摸，键盘，陀螺仪和自定义事件。 
    在 Creator 的设计中，鼠标，触摸和自定义事件的监听和派发


