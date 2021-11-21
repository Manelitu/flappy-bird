function newElement(tagName, className) {
    const element = document.createElement(tagName);
    element.className = className;
    return element
}; // Criar um elemento e nome da classe

function Barrier(reverse = false) {
    this.createdElement = newElement('div', 'barrier');

    const pipeBorder = newElement('div', 'pipe-border');
    const pipeBody = newElement('div', 'pipe-body');
    this.createdElement.appendChild(reverse ? pipeBody : pipeBorder);
    this.createdElement.appendChild(reverse ? pipeBorder : pipeBody);

    this.setHeight = height => pipeBody.style.height = `${height}px`;
}

function BarrierPairs(height, gapUpLow, x) {
    this.createdElement = newElement('div', 'barrier-pairs');
    this.upper = new Barrier(true);
    this.lower = new Barrier();

    this.createdElement.appendChild(this.upper.createdElement);
    this.createdElement.appendChild(this.lower.createdElement);

    this.drawGap = () => {
        const upperHeight = Math.random() * (height - gapUpLow);
        const lowerHeight = height - gapUpLow - upperHeight;
        this.upper.setHeight(upperHeight);
        this.lower.setHeight(lowerHeight);
    }

    this.getX = () => parseInt(this.createdElement.style.left.split('px')[0]); //Ler o valor de X
    this.setX = x => this.createdElement.style.left = `${x}px`;
    this.getWidth = () => this.createdElement.clientWidth;

    this.drawGap();
    this.setX(x);
}

function Barriers(height, width, gapUpLow, gapBarriers, showPoint) {
    this.pairs = [
        new BarrierPairs(height, gapUpLow, width),
        new BarrierPairs(height, gapUpLow, width + gapBarriers),
        new BarrierPairs(height, gapUpLow, width + gapBarriers * 2),
        new BarrierPairs(height, gapUpLow, width + gapBarriers * 3)
    ]

    const displacement = 3;
    this.animation = () => {
        this.pairs.forEach(pair => {
            pair.setX(pair.getX() - displacement);

            //Quando o elemento sair da tela do jogo
            if (pair.getX() < -pair.getWidth()) {
                pair.setX(pair.getX() + gapBarriers * this.pairs.length);
                pair.drawGap();
            };

            const mid = width / 2;
            const crossTheMid = pair.getX() + displacement >= mid && pair.getX() < mid;
            if (crossTheMid) showPoint();
        });
    }
}

function Bird(gameHeight) {
    let flying = false;

    this.createdElement = newElement('img', 'bird');
    this.createdElement.src = 'imgs/passaro.png';

    this.getY = () => parseInt(this.createdElement.style.bottom.split('px')[0])
    this.setY = y => this.createdElement.style.bottom = `${y}px`;

    window.onkeydown = e => flying = true;
    window.onkeyup = e => flying = false;

    this.animation = () => {
        const newY = this.getY() + (flying ? 6 : -4);
        const maxHeight = gameHeight - this.createdElement.clientHeight;

        if (newY <= 0) {
            this.setY(0);
        } else if (newY >= maxHeight) {
            this.setY(maxHeight);
        } else {
            this.setY(newY);
        }
    }

    this.setY(gameHeight / 2);

}

function Progress() {
    this.createdElement = newElement('span', 'progress');
    this.pointUpdate = points => {
        this.createdElement.innerHTML = points;
    }

    this.pointUpdate(0);
}

function overlayBox(firstElement, secondElement) {
    const element_a = firstElement.getBoundingClientRect();
    const element_b = secondElement.getBoundingClientRect();

    const horizontalHit = element_a.left + element_a.width >= element_b.left &&
        element_b.left + element_b.width >= element_a.left;

    const verticalHit = element_a.top + element_a.height >= element_b.top &&
        element_b.top + element_b.height >= element_a.top;
    return horizontalHit && verticalHit;

}

function hitBox(bird, barriers) {
    let collide = false;
    barriers.pairs.forEach(barrierPairs => {
        if (!collide) {
            const upper = barrierPairs.upper.createdElement;
            const lower = barrierPairs.lower.createdElement;
            collide = overlayBox(bird.createdElement, upper) 
            || overlayBox(bird.createdElement, lower);
        }
    });
    return collide;
}


function FlappyBird() {
    let points = 0;

    const gameArea = document.querySelector('[flappy]');
    const height = gameArea.clientHeight;
    const width = gameArea.clientWidth;

    const progress = new Progress();
    const barriers = new Barriers(height, width, 200, 400, () => progress.pointUpdate(++points));
    const bird = new Bird(height);
    gameArea.appendChild(progress.createdElement);
    gameArea.appendChild(bird.createdElement);
    barriers.pairs.forEach(pair => gameArea.appendChild(pair.createdElement));

    this.start = () => {
        //game loop
        const timer = setInterval(() => {
            barriers.animation();
            bird.animation();

            if (hitBox(bird, barriers)) {
                clearInterval(timer);
            }
        }, 20);
    }
}

new FlappyBird().start();