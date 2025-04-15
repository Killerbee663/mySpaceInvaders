const tileSize = 16;
const rows = 55;
const columns = 90;
const boardHeight = tileSize * rows;
const boardWidth = tileSize * columns;
let context;
let board;
let keys = {}; //object to track pressed keys

//ship
let shipX = tileSize * columns/2 - tileSize;
let shipY = tileSize * rows - tileSize*4;
const shipWidth = tileSize *5;
const shipHeight = tileSize *3;
const shipVelocityX = tileSize/4;
const ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight,
    alive : true
}
let shipImg;
let bullets = [];

//alien
let alienImgs = [];
let alienArray1 = [];
let alienArray2 = [];
let alienWidth = tileSize*5;
let alienHeight = tileSize*3;
let alienRows = 2;
let alienColumns = 3;
let alienCount = 0;
let alienCount2 = 0;
let alienImg;
const alienX = tileSize;
const alienY = tileSize;
let alienVelocityX = 1.4;
let alienVelocityX2 = 1.8;
let createAliens1Count = 0;


let score = 0;
let gameOver = false;
let gameOverSoundPlayed = false;
let gameSongPlaying = false;
let gameStart = false;

let shootSound = document.getElementById("shootSound");
let explosionSound = document.getElementById("explosionSound");
let gameOverSound = document.getElementById("gameOverSound");
let gameSong = document.getElementById("gameSong");



window.onload = function() {
    board = document.getElementById("board");
    context = board.getContext("2d")
    board.width = boardWidth;
    board.height = boardHeight;


    shipImg = new Image();
    shipImg.src = "./resources/ship.png"
    shipImg.onload = function() {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)
    }

    for (let i = 0; i < 4; i++){
        alienImg = new Image();
        alienImg.src = `./resources/alien${i}.png`
        alienImgs.push(alienImg);
    }
    aliensPopulation.createAliens1();


    //requestAnimationFrame(update)
    document.addEventListener("keydown", (e) => {
        keys[e.code] = true;

        //on first interaction
        if (!gameSongPlaying) {
            gameSong.play();
            gameSongPlaying = true;
        }
        if (!gameStart){
            update();
            gameStart = true;
        }
    });

    document.addEventListener("keyup", (e) => {
        keys[e.code] = false;
        if (e.code === "Space") {
            shipShoot();
        }
    });
    
};

function update(){

    if (gameOver) {
        if (!gameOverSoundPlayed) {
            gameOverSound.play();
            gameOverSoundPlayed = true;

            gameSongPlaying = false;
            gameSong.pause();
            //gameSong.currentTime = 0;
        }
        return;
    }


    requestAnimationFrame(update)
    context.clearRect(0, 0, boardWidth, boardHeight)

    //ship movment
    if (keys["ArrowLeft"] && ship.x - shipVelocityX >= 0){
        ship.x -= shipVelocityX;
    } else if (keys["ArrowRight"] && ship.x + shipVelocityX + ship.width <= board.width){
        ship.x += shipVelocityX;
    }

    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height)

    //tracking bullets
    for(let i = 0; i < bullets.length; i++){
        let bullet = bullets[i];
        bullet.y -= tileSize;

        //remove bullets off-screen
        if(bullet.y < 0){
            bullets.splice(i, 1);
            i--;
        } else {
            context.fillStyle = "white";
            context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
    }

    //alien
    let touchBorder1 = false;
    for (let i = 0; i < alienArray1.length; i++) {
        let alien = alienArray1[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            //if alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                touchBorder1 = true;  //mark as touching the border
            }

            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);


            if (alien.y + alien.height >= ship.y) {
                gameOver = true;
            }
        }
    }

    let touchBorder2 = false;
    for (let i = 0; i < alienArray2.length; i++){
        let alien = alienArray2[i];
        if(alien.alive) {
            alien.x += alienVelocityX2

            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                touchBorder2 = true;
            }

            context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

            if (alien.y + alien.height >= ship.y) {
                gameOver = true;
            }
        }
    }

    checkCollision(alienArray1, 'alienCount1');
    checkCollision(alienArray2, 'alienCount2');
    
    context.font = "15px Courier";
    context.fillStyle = "white";
    context.fillText(`Score: ${score}`, 5, 15);
    
    if (touchBorder1) {
        alienVelocityX *= -1;  //reverse D
        alienArray1.forEach(alien => alien.y += alienHeight);
    }
    if (touchBorder2) {
        alienVelocityX2 *= -1;
        alienArray2.forEach(alien => alien.y += alienHeight);
    }
    if(alienCount === 0 && alienCount2 === 0) {
        createAliens1Count++;
        alienColumns +=0.5;
        alienRows += 0.5;
        alienVelocityX += 0.5;
        aliensPopulation.createAliens1()

        if (createAliens1Count >= 2 && alienCount2 === 0){
            alienVelocityX2 += 0.6666;
            aliensPopulation.createAliens2();
        }
    }
}

/*function moveShip(e) {
    if (e.code === "ArrowLeft" && ship.x - shipVelocityX >= 0){
        ship.x -= shipVelocityX;
    } else if (e.code === "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width){
        ship.x += shipVelocityX;
    }
}*/

const aliensPopulation = {
createAliens1() {
    for (let i = 0; i < alienColumns; i++){
        for(let j = 0; j < alienRows; j++){
            let randomImageIndex = Math.floor(Math.random() * alienImgs.length);

            let alien = {
                img : alienImgs[randomImageIndex],
                x : alienX + i * alienWidth,
                y: alienY + j * alienHeight,
                width: alienWidth,
                height: alienHeight,
                alive: true
            };
            alienArray1.push(alien);
        }
    }
    alienCount = alienArray1.length;
},
createAliens2() {
    for (let i = 0; i < alienColumns; i++){
        for(let j = 0; j < alienRows; j++){
            let randomImageIndex = Math.floor(Math.random() * alienImgs.length);

            let alien = {
                img : alienImgs[randomImageIndex],
                x : alienX + i * alienWidth +900,
                y: alienY + j * alienHeight + 200,
                width: alienWidth,
                height: alienHeight,
                alive: true
            };
            alienArray2.push(alien)
        }
    }
    alienCount2 = alienArray2.length;}
}


function shipShoot() {
    shootSound.play();
        let bullet = {
            x : ship.x + shipWidth / 2 - tileSize / 2,
            y : ship.y - tileSize,
            width : tileSize/2,
            height : tileSize *2
        }
        bullets.push(bullet)
}

function checkCollision(alienArray, alienCountVar) {
    for(let i = 0; i < alienArray.length; i++){
        let alien = alienArray[i];
        for(let j = 0; j < bullets.length; j++){
            let bullet = bullets[j];
            if(
                bullet.x < alien.x + alien.width &&  //bullet's left edge is before the alien's right edge
                bullet.x + bullet.width > alien.x && //bullet's right edge is after the alien's left edge
                bullet.y < alien.y + alien.height && //bullet's top edge is before the alien's bottom edge
                bullet.y + bullet.height > alien.y   //bullet's bottom edge is after the alien's top edge
            ){
                explosionSound.play();
                alien.alive = false;
                alienArray.splice(i, 1);
                bullets.splice(j, 1);
                if (alienCountVar === 'alienCount1') {
                    alienCount--;
                } else {
                    alienCount2--;
                }
                score += 100;
                j--;
                i--;
                break; //hit and exit loop
            }
        }
    }
}