cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius: 0
    },

    // use this for initialization
    onLoad: function () {

    },

    getPlayerDistance: function(){
        var playerPos = this.game.player.getPosition();

        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function(){
        this.game.spawnNewStar();
        this.game.gainScore();

        this.node.destroy();
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this.getPlayerDistance() < this.pickRadius){
            this.onPicked();
            return;
        }

        var opacityRatio = 1- this.game.timer / this.game.starDuration;
        var minOpcity = 50;
        this.node.opacity = minOpcity + Math.floor(opacityRatio * (255 - minOpcity));
    },
});
