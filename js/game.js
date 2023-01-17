var key_code_left=37;
var key_code_right=39;
var key_code_space=32;
var game_width=800;
var game_height=600;
var player_width=20;
var player_max_speed=400;
var laser_max_speed=300;
var laser_cooldown=.25;
var ENEMIES_PER_ROW = 10;
var ENEMY_HORIZONTAL_PADDING =80;
var ENEMY_VERTICAL_PADDING =70;
var ENEMY_VERTICAL_SPACING =80;


var game_state={
    lasttime:Date.now(),
    leftpressed:false,
    rightpressed:false,
    spacepressed:false,
    playerx :0,
    playery:0,
    playerCooldown:0,
    lasers :[],
    enemies:[]
    
};


function rectsIntersect(r1,r2){
    return !(
        r1.left > r1.right ||
        r2.right < r1.left ||
        r2.top > r1.bottom ||
        r2.bottom < r1.top
    )
};

function setposition($el,x,y){
    
    $el.style.transform =`translate(${x}px,${y}px)`;
   
}

function clamp(v,min,max){
    if(v<min){
        return min;
    }else if (v>max){
        return max;
    }else{
        return v;
    }
}

function createplayer($container) {
    
    
    game_state.playerx=game_width / 2;
    game_state.playery=game_height-50;
    var $player =document.createElement("img");
    $player.src = "img/hero.png";
    $player.className="player";
    $container.appendChild($player);
    setposition($player, game_state.playerx, game_state.playery);
        

}

function init(){
    var $container = document.querySelector(".game");
    createplayer($container);
    
    const enemyspacing = (game_width - ENEMY_HORIZONTAL_PADDING *2)/
          (ENEMIES_PER_ROW - 1);
    for(let j =0 ;j < 3;j++){
        const y = ENEMY_VERTICAL_PADDING + j *ENEMY_VERTICAL_SPACING;
        for(let i=0;i<ENEMIES_PER_ROW;i++){
            const x = i*enemyspacing + ENEMY_HORIZONTAL_PADDING;
            createEnemy($container, x, y);
        }
        
    }
}

function updateplayer(dt,$container){
    if(game_state.leftpressed){
        game_state.playerx -=dt * player_max_speed; 
    }
   if(game_state.rightpressed){
        game_state.playerx +=dt * player_max_speed;
    }
    game_state.playerx=clamp(game_state.playerx,player_width,game_width-player_width);
    
    if(game_state.spacepressed && game_state.playerCooldown <=0){
        creatlaser($container,game_state.playerx,game_state.playery);
        game_state.playerCooldown =laser_cooldown;
    }
    
    if(game_state.playerCooldown > 0){
        game_state.playerCooldown -= dt;
    }
    
    
    const $player=document.querySelector(".player");
    setposition($player,game_state.playerx,game_state.playery)
}

function creatlaser($container,x,y){
    const $element=document.createElement("img");
    $element.src="img/missile1.png";
    $element.className="laser";
    $container.appendChild($element);
    const laser ={x,y,$element};
    game_state.lasers.push(laser);
    setposition($element,x,y);
   const audio = new Audio("sound/sfx-laser1.ogg");
    audio.play();   
    
    
}

function updatelasers(dt,$container){
    
    const lasers = game_state.lasers;
    
    for (var i=0; i < lasers.length ; i++) {
        const laser =lasers[i];
        laser.y -= dt * laser_max_speed;
        if(laser.y < 0){
            destroylaser($container,laser);
        }
       setposition(laser.$element, laser.x,laser.y);
        const r1 = laser.$element.getBoundingClientRect();
        const enemies = game_state.enemies;
        for(let j =0 ; j< enemies.length;j++){
            
            const enemy = enemies[j];
            if(enemy.isDead) continue;
            const r2 =enemy.$element.getBoundingClientRect();
            if(rectsIntersect(r1,r2)){
                destroyEnemy($container,enemy);
                destroylaser($container,laser);
                break;
            }
        }
    }
    game_state.lasers =game_state.lasers.filter(e => !e.isDead);
}

function destroylaser($container,laser){
    $container.removeChild(laser.$element);
    laser.isDead = true;
}

function createEnemy($container, x, y){
    const $element= document.createElement("img");
    $element.src="img/BigChicken.png";
    $element.className="enemy";
    $container.appendChild($element);
    
    const enemy ={
        x,
        y,
        $element
    };
    game_state.enemies.push(enemy);
    setposition($element,x,y);
}


function updateEnemies(dt,$container){
    const dx =Math.sin(game_state.lasttime /1000.0) *50 ;
    const dy = Math.cos(game_state.lasttime / 1000.0)*10;
    
    const enemies =game_state.enemies;
    for(let i=0; i<enemies.length;i++){
        const enemy =enemies[i];
        const x =enemy.x +dx;
        const y = enemy.y +dy;
        setposition(enemy.$element,x,y);
    }
    game_state.enemies = game_state.enemies.filter(e => !e.isDead);
}

function destroyEnemy($container,enemy){
    $container.removeChild(enemy.$element);
    enemy.isDead = true;
}



function update(){
    var currentTime=Date.now();
    var dt =(currentTime-game_state.lasttime)/1000;
    
    const $container = document.querySelector(".game");
    updateplayer(dt ,$container);
    updatelasers(dt ,$container);
    updateEnemies(dt,$container);
    game_state.lasttime=currentTime;
    window.requestAnimationFrame(update);
}



function onkeydown(e){
    if (e.keyCode==key_code_left)
        {
            game_state.leftpressed=true;
        } 
    else if (e.keyCode==key_code_right)
        {
               game_state.rightpressed=true;
        }
    
    else if (e.keyCode==key_code_space)
        {
               game_state.spacepressed=true;
        }
    
}



function onkeyup(e){
    if (e.keyCode==key_code_left)
        {
            game_state.leftpressed=false;
        } 
    else if (e.keyCode==key_code_right)
        {
               game_state.rightpressed=false;
        }
    
    else if (e.keyCode==key_code_space)
        {
               game_state.spacepressed=false;
        }
}



init();
window.addEventListener("keydown",onkeydown);
window.addEventListener("keyup",onkeyup);
window.requestAnimationFrame(update);

