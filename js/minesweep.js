'use strict'

var gBoard = []
var gTimeInterval
var gLevel = {
    SIZE: 4,
    MINES: 2
};
var gGame = {
    isOn: false,
    isOver: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0,
    lives: 3,
    hints: 3
};
//use to check we didn't traversed cell twice during recursion
var gRecTraveresd = {};
function getRandomInteger(min, max) {
    var rand = Math.random()
    var dis = (max - min)
    var randomNum = min + (rand * dis)
    return Math.floor(randomNum)
}

function randMineLocation(row, col) {
    //place mines at the start of the array
    for (var i = 0; i < gLevel.MINES; i++) {
        gBoard[Math.floor(i / gLevel.SIZE)][i % gLevel.SIZE].isMine = true
    }
    //shuffel array (besides the last cell)
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var temp = gBoard[i][j].isMine
            //switch last cell with clickled location
            if (i === gLevel.SIZE - 1 && j === gLevel.SIZE - 1) {
                gBoard[i][j].isMine = gBoard[row][col].isMine
                gBoard[row][col].isMine = temp
            }
            else {
                var rand = getRandomInteger(0, gLevel.SIZE ** 2 - 2)
                gBoard[i][j].isMine = gBoard[Math.floor(rand / gLevel.SIZE)][rand % gLevel.SIZE].isMine
                gBoard[Math.floor(rand / gLevel.SIZE)][rand % gLevel.SIZE].isMine = temp
            }
        }
    }

}
function buildBoard() {
    gBoard = []
    for (var i = 0; i < gLevel.SIZE; i++) {
        gBoard.push([])
        for (var j = 0; j < gLevel.SIZE; j++) {
            var cell = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isTripped: false,
                isMarked: false
            };
            gBoard[i].push(cell)
        }
    }


}

function checkGameOver() {
    if (gGame.lives === 0 || gGame.shownCount + gGame.markedCount === gLevel.SIZE ** 2) {
        console.log(1);
        resetTimer()
        gGame.isOn = false
        gGame.isOver = true
        for (var i = 0; i < gLevel.SIZE; i++) {
            for (var j = 0; j < gLevel.SIZE; j++) {
                //revealing mines
                if (gBoard[i][j].isMine) {
                    gBoard[i][j].isShown = true
                }

            }
        }
        return true
    }
    return false
}
function cellMarked(elCell) {
    if (!gGame.isOver) {
        var cellData = elCell.id.split('_')
        var row = +cellData[0]
        var col = +cellData[1]
        if (!gGame.isOn) {
            gGame.isOn = true
            randMineLocation(row, col)
            setMinesNegsCount()
        }
        //don't mark if shown
        if (!gBoard[row][col].isShown) {
            if (gBoard[row][col].isMarked) {
                gBoard[row][col].isMarked = false
                gGame.markedCount--
                elCell.innerHTML = ""
            }
            else if (gLevel.MINES - gGame.markedCount - (3 - gGame.lives) != 0) { //add marker only if needed
                gBoard[row][col].isMarked = true
                gGame.markedCount++
            }
        }
        //show changes
        checkGameOver()
        renderBoard()
    }
}
function validCell(row, col) {
    if ((row >= 0) && (row < gLevel.SIZE) && (col >= 0) && (col < gLevel.SIZE))
        return true
    return false
}

//recursively reveals the area
function revealArea(row, col) {
    var cellId = row + '_' + col
    if (validCell(row, col) && gBoard[row][col].minesAroundCount === 0 &&
        !(cellId in gRecTraveresd) && !gBoard[row][col].isMine) {
        console.log(2);
        gRecTraveresd[cellId] = 1
        revealSquare(row, col)
        revealArea(row + 1, col)
        revealArea(row, col - 1)
        revealArea(row, col + 1)
        revealArea(row - 1, col)
    }

}
//reveals one square (3x3)
function revealSquare(row, col) {
    revealCell(row - 1, col)
    revealCell(row - 1, col - 1)
    revealCell(row - 1, col + 1)
    revealCell(row, col - 1)
    revealCell(row, col + 1)
    revealCell(row + 1, col)
    revealCell(row + 1, col - 1)
    revealCell(row + 1, col + 1)
}
//reveal one cell
function revealCell(row, col) {

    if (validCell(row, col)) {
        if (!gBoard[row][col].isShown)
            gGame.shownCount++
        gBoard[row][col].isShown = true
    }
}
function cellClicked(elCell) {
    if (!gGame.isOver) {
        var cellData = elCell.id.split('_')
        var row = Number(cellData[0])
        var col = Number(cellData[1])
        if (!gGame.isOn) {
            gGame.isOn = true
            gTimeInterval = setInterval(updateTimer, 1000)
            randMineLocation(row, col)
            setMinesNegsCount()
        }
        //if the cell is shown or marked, do nothing.
        if (!gBoard[row][col].isShown || !gBoard[row][col].isMarked) {
            gBoard[row][col].isShown = true
            gGame.shownCount++
            if (gBoard[row][col].isMine && !gBoard[row][col].isTripped) {
                gGame.lives--
                gBoard[row][col].isTripped = true
            }
            if (gBoard[row][col].minesAroundCount === 0) {
                gRecTraveresd = {};
                revealArea(row, col)
            }
        }
        checkGameOver()
        renderBoard()
    }
}
function renderBoard() {
    var elTable = document.querySelector(".game-board")
    // going over the html table 
    for (var i = 0; i < elTable.rows.length; i++) {
        for (var j = 0; j < elTable.rows.length; j++) {
            var elCell = elTable.rows[i].cells[j]
            elCell.setAttribute("onclick", "cellClicked(this)")
            elCell.setAttribute("oncontextmenu", "cellMarked(this)")
            elCell.id = i + '_' + j
            if (gBoard[i][j].isShown) {
                elCell.innerHTML = "<div class='shown-cell'></div>"
                var elDiv = elCell.querySelector("shown-cell")
                if (gBoard[i][j].isTripped) {
                    //cell.className = "exploded-mine"
                    elCell.innerHTML = "<div class='shown-cell'><img src='img/bomb.png' class='exploded-mine'/></div>"

                }
                else {
                    if (gBoard[i][j].minesAroundCount != 0) {
                        elCell.innerHTML = "<div class='shown-cell'>" + gBoard[i][j].minesAroundCount + "</div>"
                    }
                    if (gBoard[i][j].isMine) {
                        if (gBoard[i][j].isMarked) {
                            elCell.innerHTML = "<div class='shown-cell'><img src='img/bomb.png' class='disabled-mine'/></div>"
                        }
                        else {
                            elCell.innerHTML = "<div class='shown-cell'><img src='img/bomb.png' class='live-mine'/></div>"
                        }
                    }
                }
            }
            else {
                elCell.innerHTML = "<div class='unshown-cell'></div>"
                if (gBoard[i][j].isMarked) {
                    elCell.innerHTML = "<div class='unshown-cell'><img src='img/flag.png' class='flag'/></div>"

                }
            }
        }
    }
    updateGameBar()
}
function checkIsMine(row, col) {
    if (validCell(row, col)) {
        if (gBoard[row][col].isMine) {
            return 1
        }
    }
    return 0
}
function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var minecount = 0
            minecount += checkIsMine(i - 1, j)
            minecount += checkIsMine(i - 1, j - 1)
            minecount += checkIsMine(i - 1, j + 1)
            minecount += checkIsMine(i, j - 1)
            minecount += checkIsMine(i, j + 1)
            minecount += checkIsMine(i + 1, j)
            minecount += checkIsMine(i + 1, j - 1)
            minecount += checkIsMine(i + 1, j + 1)
            gBoard[i][j].minesAroundCount = minecount
        }
    }
}

function initGame() {
    initGameBar()
    initBoard()
    buildBoard()
    renderBoard()
}
function resetGame() {
    gBoard = []

    document.querySelector(".game-board tbody").remove()

    gGame = {
        isOn: false,
        isOver: false,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0,
        lives: 3,
        hints: 3
    };
    resetTimer()
    updateGameBar()
    initBoard()
    buildBoard()
    renderBoard()

}
function resetTimer() {
    clearInterval(gTimeInterval)
    gGame.secsPassed = 0
}
function updateTimer() {
    var elCells = document.querySelectorAll(".game-bar thead th")
    gGame.secsPassed++
    if (gGame.secsPassed >= 9999) {
        gGame.secsPassed = 9999
    }
    elCells[4].innerHTML = gGame.secsPassed
}


function changeDifficulty(elBtn) {
    var difficulty = elBtn.innerHTML
    switch (difficulty) {
        case "Easy":
            gLevel.SIZE = 4
            gLevel.MINES = 2
            break;
        case "Medium":
            gLevel.SIZE = 8
            gLevel.MINES = 12
            break;
        case "Metal":
            gLevel.SIZE = 12
            gLevel.MINES = 30

            break;
        default:
            break;
    }
    resetGame()
}
function initBoard() {
    var elTable = document.querySelector(".game-board")
    var tbody = elTable.createTBody()
    for (var i = 0; i < gLevel.SIZE; i++) {
        var row = tbody.insertRow()
        for (var j = 0; j < gLevel.SIZE; j++) {
            var elCell = row.insertCell()
            elCell.innerHTML = "<div class='unshown-cell'></div>"
        }
    }
}
function updateGameBar() {
    var elCells = document.querySelectorAll(".game-bar thead th")
    //update lives
    elCells[0].innerHTML = ""
    for (var i = 0; i < gGame.lives; i++)
        elCells[0].innerHTML += "<img src='img/heart.png' class='game-bar-icon'/>"
    //update hints
    elCells[1].innerHTML = gGame.hints + "hints"
    //update smiley
    if (gGame.isOver) {
        if (gGame.lives === 0) {
            elCells[2].innerHTML = "<img src='img/skull.png' class='game-bar-icon'/>"
        }
        else {
            elCells[2].innerHTML = "<img src='img/trophy.png' class='game-bar-icon'/>"
        }
    }
    else {
        elCells[2].innerHTML = "<img src='img/smiley.png' class='game-bar-icon'/>"
    }
    //update mines
    elCells[3].innerHTML = gLevel.MINES - gGame.markedCount - (3 - gGame.lives) + "<img src='img/bomb.png' class='game-bar-icon'/>"
    //update timer (if needed)
    elCells[4].innerHTML = gGame.secsPassed
}
function initGameBar() {
    var elTable = document.querySelector(".game-bar")
    var thead = elTable.createTHead()
    var row = thead.insertRow()
    //init lives
    var elCell = document.createElement('th')
    elCell.innerHTML = "<img src='img/heart.png' class='game-bar-icon'/>"
    row.appendChild(elCell)
    //init hints
    elCell = document.createElement('th')
    elCell.innerHTML = "3 hints"
    row.appendChild(elCell)
    //init smiley
    elCell = document.createElement('th')
    elCell.innerHTML = "<img src='img/smiley.png' class='game-bar-icon'/>"
    elCell.onclick = resetGame
    row.appendChild(elCell)
    //init mine count
    elCell = document.createElement('th')
    elCell.innerHTML = gLevel.MINES + "<img src='img/bomb.png' class='game-bar-icon'/>"
    row.appendChild(elCell)
    //init timer
    elCell = document.createElement('th')
    elCell.innerHTML = '0'
    row.appendChild(elCell)
}