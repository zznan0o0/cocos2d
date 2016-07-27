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

    * addListener(key, callback, target) return Boolean
    监听加载项（通过 key 指定）的完成事件。

    * EventListener 
    封装用户的事件处理逻辑。 注意：这是一个抽象类，开发者不应该直接实例化这个类
    .UNKNOWN  未知的事件监听器类型
    .KEYBOARD  键盘事件监听器类型
    .ACCELERATION  加速器事件监听器类型

    * onKeyPressed 和 onKeyReleased分别为键盘按下和松开事件

## 制作星星
### 制作Prefab
将图拖到层级管理器中， 接着拖回资源管理器中就完成了      
创建Star并添加到star Prefab资源中
```javascript
// Star.js
    properties: {
        // 星星和主角之间的距离小于这个数值时，就会完成收集
        pickRadius: 0
    },
```
设置属性

增加Game.js
```javascript
// Game.js
    properties: {
        // 这个属性引用了星星预制资源
        starPrefab: {
            default: null,
            type: cc.Prefab
        },
        // 星星产生后消失时间的随机范围
        maxStarDuration: 0,
        minStarDuration: 0,
        // 地面节点，用于确定星星生成的高度
        ground: {
            default: null,
            type: cc.Node
        },
        // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
        player: {
            default: null,
            type: cc.Node
        }
    },
```


设置相关属性

### 在随机位置生成星星
```javascript
// Game.js
    onLoad: function () {
        // 获取地平面的 y 轴坐标
        this.groundY = this.ground.y + this.ground.height/2;
        // 生成一个新的星星
        this.spawnNewStar();
    },

    spawnNewStar: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
    },

    getNewStarPosition: function () {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width/2;
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    }
```

    * instantiate (original) return Object
    复制给定的对象
    Instantiate 时，function 和 dom 等非可序列化对象会直接保留原有引用，
    Asset 会直接进行浅拷贝，可序列化类型会进行深拷贝。

    * addChild(child, [localZOrder], [tag])
    添加子节点，并且可以修改该节点的 局部 Z 顺序和标签。
    child: Node 节点
    localZOrder： Number 绘制循序
    tag: Number|String  标签

    * setPosition(newPosOrxValue  , [yValue])
    设置节点在父坐标系中的位置。
    可以通过 2 种方式设置坐标点：
    1.传入 cc.v2(x, y) 类型为 cc.Vec2 的对象。
    2.传入 2 个数值 x 和 y。

    * random0To1() 随机函数具体，详情未知

    * getComponent(typeOrClassName) return Component
    获取节点上指定类型的组件，如果节点有附加指定类型的组件，
    则返回，如果没有则为空。
    传入参数也可以是脚本的名称。

    * randomMinus1To1() 随机函数具体，详情未知

### 添加主角碰触收集星星的行为

```javascript
// Game.js
    spawnNewStar: function() {
        // ...
        // 将 Game 组件的实例传入星星组件
        newStar.getComponent('Star').game = this;
    },
```

判断距离
```javascript
// Star.js
    getPlayerDistance: function () {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 然后销毁当前星星节点
        this.node.destroy();
    },
```
update
```javascript
// Star.js
    update: function (dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
    },
```

    * getPosition()  return Vec2
    获取在父节点坐标系中节点的位置（ x , y ）

    * pDistance(v1, v2) return Number
    返回指定 2 个向量之间的距离。 
    * destroy ( ) 
    销毁该对象，并释放所有它对其它对象的引用。
    销毁后，CCObject 不再可用。
    您可以在访问对象之前使用 cc.isValid(obj)（或 obj.isValid 如果 obj 不为 null）来检查对象是否已被销毁。

## 添加得分
添加分数文字（Label）并改属性

### 在 Game 脚本中添加得分逻辑

```javascript
// Game.js
    properties: {
        // ...
        // score label 的引用
        scoreDisplay: {
            default: null,
            type: cc.Label
        }
    },
```

```javascript
// Game.js
    onLoad: function () {
        // ...
        // 初始化计分
        this.score = 0;
    },
```

```javascript
// Game.js
    gainScore: function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
    },
```

```javascript
// Star.js
    onPicked: function() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 调用 Game 脚本的得分方法
        this.game.gainScore();
        // 然后销毁当前星星节点
        this.node.destroy();
    },
```

## 失败判定和重新开始
### 为星星加入计时消失的逻辑
```javascript
// Game.js
    onLoad: function () {
        // ...
        // 初始化计时器
        this.timer = 0;
        this.starDuration = 0;
        // 生成一个新的星星
        this.spawnNewStar();
        // 初始化计分
        this.score = 0;
    },
```

```javascript
// Game.js
    spawnNewStar: function() {
        // ...
        // 重置计时器，根据消失时间范围随机取一个值
        this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
        this.timer = 0;
    },
```

```javascript
// Game.js
    update: function (dt) {
        // 每帧更新计时器，超过限度还没有生成新的星星
        // 就会调用游戏失败逻辑
        if (this.timer > this.starDuration) {
            this.gameOver();
            return;
        }
        this.timer += dt;
    },
```

```javascript
// Game.js
    gameOver: function () {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');
    }
```

```javascript
// Star.js
    update: function() {
        // ...
        // 根据 Game 脚本中的计时器更新星星的透明度
        var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
    }
```

## 加入音效
###  跳跃音效
```javascript
// Player.js
    properties: {
        // ...
        // 跳跃音效资源
        jumpAudio: {
            default: null,
            url: cc.AudioClip
        },
    },
```

```javascript
// Player.js
    setJumpAction: function () {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 下落
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());
        // 添加一个回调函数，用于在动作结束时调用我们定义的其他方法
        var callback = cc.callFunc(this.playJumpSound, this);
        // 不断重复，而且每次完成落地动作后调用回调来播放声音
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },

    playJumpSound: function () {
        // 调用声音引擎播放声音
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
```

### 得分音效
```javascript
// Game.js
    properties: {
        // ...
        // 得分音效资源
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        }
    },
```

```javascript
// Game.js
    gainScore: function () {
        this.score += 1;
        // 更新 scoreDisplay Label 的文字
        this.scoreDisplay.string = 'Score: ' + this.score.toString();
        // 播放得分音效
        cc.audioEngine.playEffect(this.scoreAudio, false);
    },
```

    * callFunc(selector, [selectorTarget], [data]) return ActionInstant
    执行回调函数。

    *cc.audioengine是单例对象。
    主要用来播放背景音乐和音效，背景音乐同一时间只能播放一个，
    而音效则可以同时播放多个。
    注意：
    在 Android 系统浏览器上，不同浏览器，不同版本的效果不尽相同。
    比如说：大多数浏览器都需要用户物理交互才可以开始播放音效，
    有一些不支持 WebAudio，有一些不支持多音轨播放。
    总之如果对音乐依赖比较强，请做尽可能多的测试。

    *playEffect(url, loop, volume) return Number|Null
    播放指定音效，并可以设置是否循环播放。
    注意：在部分不支持多音轨的浏览器上，这个接口会失效，请使用 playMusic 



