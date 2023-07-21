let board
let onPieceFocus = false;
let focusedField; // div unter piece
let focusedPiece; // img element

let whitesTurn = true

let whitePawnSwapCounter = "I";
let blackPawnSwapCounter = "I";

let enPassantPawn = null;

let whiteCanCastle = true;  //castle variablen
let blackCanCastle = true;

let wKRookMoved = false;
let bKRookMoved = false;

let wQRookMoved = false;
let bQRookMoved = false;

let chessCheck = true;

let movesound = document.getElementById("mvsound")
let takesound = document.getElementById("tksound")
let castlesound = document.getElementById("cssound")
let promotesound = document.getElementById("prsound")
let checksound = document.getElementById("cksound")

let markedMoves = [];


function createGame() {
    board = [["wrA", "wnB", "wbC", "wq", "wk", "wbF", "wnG","wrH"],
    ["wpA", "wpB", "wpC", "wpD", "wpE", "wpF", "wpG","wpH"],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["bpA", "bpB", "bpC", "bpD","bpE","bpF", "bpG" ,"bpH"],
    ["brA", "bnB", "bbC", "bq","bk","bbF", "bnG" ,"brH"]
    ];
}

function reset() {
    location.reload();
}

function showMoves(element) {
    let pieceID = element.id
    let currBoard = board

    if (pieceID.startsWith("w") && whitesTurn || pieceID.startsWith("b") && !whitesTurn) {
        if (focusedPiece) {
            deleteMarker()
            unmarkPiece()
        }
        focusedPiece = element
        let piecePos = givePosition(currBoard, element.id)
        let pieceType = getPieceType(element.id)
        let legalMoves = getLegalMoves(piecePos, pieceType, currBoard)

        markfocusedPiece(piecePos)
        markLegalMoves(legalMoves)
    }
}

function changeTurn() {

    let textTurn = document.getElementById('turntext')
    let textCheck = document.getElementById('checktext')
    let moveamount
    let scaredemoji = '\u{1F631}'
    let MeWhenStalemate = '\u{1F926}'

    if (whitesTurn) {
        whitesTurn = false
        if (isPlayerInChess("b", board)) {
            document.getElementById('bk').classList.add('incheck')
            checksound.play()
        }
        document.getElementById('wk').classList.remove('incheck')
        textTurn.innerHTML = 'BLACKS TURN'
        moveamount = getAllPossibleMovesOfPlayer("b", board).length
    }
    else {
        whitesTurn = true
        if (isPlayerInChess("w", board)) {
            document.getElementById('wk').classList.add('incheck')
            checksound.play()
        }
        document.getElementById('bk').classList.remove('incheck')
        textTurn.innerHTML = 'WHITES TURN'
        moveamount = getAllPossibleMovesOfPlayer("w", board).length
    }

    if (moveamount === 0) {
        if (whitesTurn && isPlayerInChess("w", board)) {
            textCheck.innerHTML = 'BLACK WINS!'
            textTurn.innerHTML = `CHECKMATE ${scaredemoji}`
        }
        else if (!whitesTurn && isPlayerInChess("b", board)) {
            textCheck.innerHTML = 'WHITE WINS!'
            textTurn.innerHTML = `CHECKMATE ${scaredemoji}`
        }
        else {
            textCheck.innerHTML = `${MeWhenStalemate}STALEMATE${MeWhenStalemate}`
            textTurn.innerHTML = `${MeWhenStalemate}STALEMATE${MeWhenStalemate}`
        }
    }
    else {
        textCheck.innerHTML = 'Possible Moves: ' +moveamount
    }
}

function deleteMarker() {
    let activeMarker = document.getElementsByClassName("marker")
    let captureFields = document.getElementsByClassName("catch")

    while (activeMarker[0]) {
        activeMarker[0].remove()
    }
    while(captureFields[0]) {
        captureFields[0].classList.remove("catch");
    }

    markedMoves = [];
}

function unmarkPiece() {

    focusedPiece.classList.remove("focusedPiece")
    focusedPiece = null;
    focusedField = null;
}

function givePosition(boardArray, elementId) {   // returned position objekt von elementID / location im boardArray

    for(let i = 0; i < boardArray.length; i++) {
        for(let j = 0; j < boardArray[i].length; j++) {

            if(boardArray[i][j] === elementId) {
                return position = {
                    row: i,
                    col: j
                }
            }
        }
    }
}

function getPieceType(id) {
    let arr = Array.from(id)

    if(arr[1] === 'p') {
        return arr[0] + arr[1]
    }
    else {
        return arr[1]
    }
}

function markfocusedPiece(piecePos) {
    onPieceFocus = true
    let boardPosition = getFieldFromPosition(piecePos)
    focusedField = document.getElementById(boardPosition)
    focusedPiece.classList.add("focusedPiece")
}

function getFieldFromPosition(pos) {
    let row = pos.row+1
    let col

    switch(pos.col) {
        case 0:
            col = "A"
        break
        case 1:
            col = "B"
        break
        case 2:
            col = "C";
            break;
        case 3:
            col = "D";
            break;
        case 4:
            col = "E";
            break;
        case 5:
            col = "F";
            break;
        case 6:
            col = "G";
            break;
        case 7:
            col = "H";
            break;
    }
    return row+col
}

async function movePiece(newField) {
    let soundplayed = false
    newField = newField.parentElement
    if (markedMoves.includes(newField.id)) { // wenn angeklicktes feld eins der markierten legalen moves felder ist --> piece darf dahin moven
        let newFieldPos = fieldIDToBoardPos(newField.id) // positions objekt des zielfeldes
        if (newField.classList.contains("catch")) {
            let catchedPiece = board[newFieldPos.row][newFieldPos.col]  // piece das gecaptured wird (im board array)
            let catchedPieceDom = document.getElementById(catchedPiece) // piece das gecaptured wird (DOM element)
            catchedPieceDom.remove()
            takesound.play()
            soundplayed = true
        }

        let pieceRow = focusedPiece.classList[1]    // img element bewegen
        let pieceCol = focusedPiece.classList[2]
        focusedPiece.classList.remove(pieceRow,pieceCol) // positions klassen des pieces entfernen
            
        let newPieceRow = newField.classList[2] // die vom ziel feld...
        let newPieceCol = newField.classList[3]
        focusedPiece.classList.add(newPieceRow,newPieceCol) // ...zum piece adden

        let piecePosOnBoard = givePosition(board, focusedPiece.id)
        
        // pawn promotion

        if (getPieceType(focusedPiece.id) == "wp" && newField.id.startsWith("8")) {     // white promotion
            let reqPiece = await promote("w")
            focusedPiece.id = "w" + reqPiece + whitePawnSwapCounter
            switch(reqPiece) {
                case "q":
                    focusedPiece.src = "imgs/wq.png"
                    break
                case "r":
                    focusedPiece.src = "imgs/wr.png"
                    break
                case "b":
                    focusedPiece.src = "imgs/wb.png"
                    break
                case "n":
                    focusedPiece.src = "imgs/wn.png"
                    break
            }
            promotesound.play()
            whitePawnSwapCounter = whitePawnSwapCounter + "I"
        }
        else if (getPieceType(focusedPiece.id) == "bp" && newField.id.startsWith("1")) {       // black promotion
            let reqPiece = await promote("b")
            focusedPiece.id = "b" + reqPiece + blackPawnSwapCounter
            switch(reqPiece) {
                case "q":
                    focusedPiece.src = "imgs/bq.png"
                    break
                case "r":
                    focusedPiece.src = "imgs/br.png"
                    break
                case "b":
                    focusedPiece.src = "imgs/bb.png"
                    break
                case "n":
                    focusedPiece.src = "imgs/bn.png"
                    break
            }
            promotesound.play()
            blackPawnSwapCounter = blackPawnSwapCounter + "I"
        }

        // en passant
        if (enPassantPawn) {
            if (focusedPiece.id.indexOf('wp') === 0) {
                if (newFieldPos.col === enPassantPawn.col && newFieldPos.row === enPassantPawn.row+1) {
                    let caughtPawn = document.getElementById(board[enPassantPawn.row][enPassantPawn.col])
                    caughtPawn.remove()
                    board[enPassantPawn.row][enPassantPawn.col] = ""
                }
            }
            else if (focusedPiece.id.indexOf('bp') === 0) {
                if (newFieldPos.col === enPassantPawn.col && newFieldPos.row === enPassantPawn.row-1) {
                    let caughtPawn = document.getElementById(board[enPassantPawn.row][enPassantPawn.col])
                    caughtPawn.remove()
                    board[enPassantPawn.row][enPassantPawn.col] = ""
                }
            }
        }

        if (focusedPiece.id.indexOf('p') === 1 && Math.abs(piecePosOnBoard.row-newFieldPos.row) === 2) {
            enPassantPawn = newFieldPos
        }
        else {
            enPassantPawn = null
        }

        // castling

        if (focusedPiece.id === "wk" && whiteCanCastle) {
            if (newField.id === "1G") {
                let wKRook = document.getElementById("wrH") // white king side rook
                let pieceRow = wKRook.classList[1]
                let pieceCol = wKRook.classList[2]

                wKRook.classList.remove(pieceRow)
                wKRook.classList.remove(pieceCol)
                wKRook.classList.add("row1")    // html img moven
                wKRook.classList.add("colF")
                board[0][5] = "wrH"     // string im board array moven
                board[0][7] = ""
                castlesound.play()
                soundplayed = true
            }
            else if (newField.id === "1C") {
                let wQRook = document.getElementById("wrA") // white queen side rook
                let pieceRow = wQRook.classList[1]
                let pieceCol = wQRook.classList[2]

                wQRook.classList.remove(pieceRow)
                wQRook.classList.remove(pieceCol)
                wQRook.classList.add("row1")    // html img moven
                wQRook.classList.add("colD")
                board[0][3] = "wrA"     // string im board array moven
                board[0][0] = ""
                castlesound.play()
                soundplayed = true
            }
        }

        else if (focusedPiece.id === "bk" && blackCanCastle) {      // black king side castling
            if (newField.id === "8G") {
                let bKRook = document.getElementById("brH")
                let pieceRow = bKRook.classList[1]
                let pieceCol = bKRook.classList[2]

                bKRook.classList.remove(pieceRow)
                bKRook.classList.remove(pieceCol)
                bKRook.classList.add("row8")    // html img moven
                bKRook.classList.add("colF")
                board[7][5] = "brH"
                board[7][7] = ""
                castlesound.play()
                soundplayed = true
            }
            else if (newField.id === "8C") {
                let bQRook = document.getElementById("brA")
                let pieceRow = bQRook.classList[1]
                let pieceCol = bQRook.classList[2]

                bQRook.classList.remove(pieceRow)
                bQRook.classList.remove(pieceCol)
                bQRook.classList.add("row8")    // html img moven
                bQRook.classList.add("colD")
                board[7][3] = "brA"
                board[7][0] = ""
                castlesound.play()
                soundplayed = true
            }
        }

        switch(focusedPiece.id) {
            case "wrA":
                wQRookMoved = true
                break
            case "wrH":
                wKRookMoved = true
                break
            case "brA":
                bQRookMoved = true
                break
            case "brH":
                bKRookMoved = true
                break
            case "wk":
                whiteCanCastle = false
                break
            case "bk":
                blackCanCastle = false
                break
        }

        if (wQRookMoved && wKRookMoved && whiteCanCastle) {
            whiteCanCastle = false
        }
        else if (bQRookMoved && bKRookMoved && blackCanCastle) {
            blackCanCastle = false
        }


        board[newFieldPos.row][newFieldPos.col] = focusedPiece.id // piece auf neue position im array stellen
        board[piecePosOnBoard.row][piecePosOnBoard.col] = ""

        if (!soundplayed) {
            movesound.play()
        }

        deleteMarker()
        unmarkPiece()
        changeTurn()
    }   
}

let choosePiece

async function promote(clr) {
    let whitePW = document.getElementById('whitePromoteContainer')
    let blackPW = document.getElementById('blackPromoteContainer')

    if (clr === "w") {
        whitePW.classList.remove("hide")    // promotion window anzeigen
        let choice = new Promise((resolve) => { choosePiece = resolve })    // es wird auf piece choice vom spieler gewartet
        await choice.then((result) => { type = result })
        whitePW.classList.add("hide")
        return type     // 1. buchstabe der ID des jeweiligen piece img wird returned
    }
    else {
        blackPW.classList.remove("hide")
        let choice = new Promise((resolve) => { choosePiece = resolve })
        await choice.then((result) => { type = result })
        blackPW.classList.add("hide")
        return type
    }
}

function fieldIDToBoardPos(fieldID) { // does exactly what the function name says, field ID zb A3 wird in position object umgewandelt, 
    let id = Array.from(fieldID)
    let row
    let col

    switch(id[0]) {
        case '1':
            row = 0
            break
        case '2':
            row = 1
            break
        case '3':
            row = 2
            break
        case '4':
            row = 3
            break
        case '5':
            row = 4
            break
        case '6':
            row = 5
            break
        case '7':
            row = 6
            break
        case '8':
            row = 7
            break
    }

    switch(id[1]) {
        case 'A':
            col = 0
            break
        case 'B':
            col = 1
            break
        case 'C':
            col = 2
            break
        case 'D':
            col = 3
            break
        case 'E':
            col = 4
            break
        case 'F':
            col = 5
            break
        case 'G':
            col = 6
            break
        case 'H':
            col = 7
            break
    }
    return position = {
        row: row,
        col: col
    }
}

function getLegalMoves(piecePos, pieceType, currBoard) {
    let color = getPieceColorAtPos(piecePos, currBoard)
    let legalMoves = []
    let position

    switch(pieceType) {
        case "wp":
            if (piecePos.row === 1) {
                for (let i=-1; i<2; i=i+2) { // nach diagonalen takes checken
                    position = {
                        row: piecePos.row+1,
                        col: piecePos.col+i
                    }

                    if(isPieceonField(position, currBoard)) { // ist figur auf vorne diagonal feld?
                        if(getPieceColorAtPos(position, currBoard) != color) {  // ist die figur gegner farbe?
                            if(chessCheck) {
                                if(tryMoveAndCheckIfChess(piecePos, position, color)) { // wuerde player sich dadurch selbst in schach setzen?
                                    continue // falls ja/true -> illegal move -> nächste forloop iteration
                                }
                            }
                            legalMoves.push(position)
                        }
                    }
                    else { // pawn kann nur mit take diagonal moven -> isPieceonField false = kein piece da -> nächste forloop iteration / andere front diagonal checken
                        continue
                    }
                }

                for (let j=1; j<=2; j++) { // 1st pawn move rule
                    position = { // = 2 frontale felder
                        row: piecePos.row+j,
                        col: piecePos.col
                    }
                    if (isPieceonField(position, currBoard)) { // checken ob pawn blocked ist
                        break
                    }
                    else { // wenn nicht blocked -> eigen schach setzung?
                        if(chessCheck) {
                            if(tryMoveAndCheckIfChess(piecePos, position, color)) { 
                                continue // wenn true ist wird trotzdem 2. feld gechecked, weil so ne weirde position vorkommen kann (bestehendes schach mit first pawn move blocken)
                            }
                        }
                        legalMoves.push(position)
                    }
                }
            }
            else { // wenn pawn schon n move gemacht hat / nicht in row 1 (=2 auf real board) steht
                if (piecePos.row+1 < 8) { // < 8 weil 8 promotion row ist
                    for (let k=-1; k<2; k=k+2) { // legale diagonale catches vorhanden?
                        position = {
                            row: piecePos.row+1,
                            col: piecePos.col+k
                        }

                        if (isPieceonField(position, currBoard)) { // same thing wie oben, ist diagonal ne figur? ist die vom feind? selber schach setzung?...
                            if (getPieceColorAtPos(position, currBoard) != color) {
                                if (chessCheck) {
                                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                        continue
                                    }
                                }
                                legalMoves.push(position)
                            }
                        }
                        else if (enPassantPawn) {
                            if (position.col === enPassantPawn.col && position.row === enPassantPawn.row+1) {
                                if (chessCheck) {
                                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                        continue
                                    }
                                }
                                legalMoves.push(position)
                            }
                        }
                        else {
                                continue
                            }
                        }
                        // normaler frontaler pawn move
                        position = {
                            row: piecePos.row+1,
                            col: piecePos.col
                        }

                        if (!isPieceonField(position, currBoard)) { // front field nicht blocked?
                            if (chessCheck) {
                                if (!tryMoveAndCheckIfChess(piecePos, position, color)) {
                                    legalMoves.push(position)
                                }
                            }
                        }
                    }
                }
            break
        
        case "bp":  // black pawn
                if (piecePos.row === 6) {
                    for (let k= -1; k<2; k=k+2) { //diagonale takes
                        position = {
                            row: piecePos.row-1,
                            col: piecePos.col+k
                        }

                        if (isPieceonField(position, currBoard)) {
                            if (getPieceColorAtPos(position, currBoard) != color) {
                                if (chessCheck) {
                                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                        continue
                                    }
                                }
                                legalMoves.push(position)
                            }
                        } 
                        else {
                                continue
                            }
                        }


                        for (let i=1; i<=2; i++) {  // frontale züge
                            position = {
                                row: piecePos.row-i,
                                col: piecePos.col
                            }

                            if (isPieceonField(position, currBoard)) {
                                break
                            }
                            else {
                                if (chessCheck) {
                                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                        continue
                                    }
                                }
                                legalMoves.push(position)
                            }
                        }
                } 
                else {
                    if(piecePos.row-1 >= 0) {
                        for (let o= -1; o<2; o=o+2) {
                            position = {
                                row: piecePos.row-1,
                                col: piecePos.col+o
                            }

                            if (isPieceonField(position, currBoard)) {
                                if (getPieceColorAtPos(position, currBoard) != color) {
                                    if (chessCheck) {
                                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                            continue
                                        }
                                    }
                                    legalMoves.push(position)
                                }
                            }
                            else if (enPassantPawn) {
                                if (position.col === enPassantPawn.col && position.row === enPassantPawn.row - 1) {
                                    if (chessCheck) {
                                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                                            continue
                                        }
                                    }
                                    legalMoves.push(position)
                                }
                            }
                            else {
                                continue
                            }
                        }

                        position = { // frontale moves
                            row: piecePos.row-1,
                            col: piecePos.col
                        }

                        if (!isPieceonField(position, currBoard)) {
                            if (chessCheck) {
                                if (!tryMoveAndCheckIfChess(piecePos, position, color)) {
                                    legalMoves.push(position)
                                }
                            }
                        }
                    }
                }
                break

        case 'n':           // knight moves

        for (let j = -1; j<2; j++) {
            if (piecePos.row+2 < 8) {   // row+2 < 8 = inside board border
                if (j != 0 && piecePos.col+j >= 0 && piecePos.col+j < 8) {
                position = {
                    row: piecePos.row+2,
                    col: piecePos.col+j
                }

                if (getPieceColorAtPos(position, currBoard) != color) {     // take
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            continue
                        }
                    }
                    legalMoves.push(position)
                }
            }
        }
    }

    for (let j= -1; j<2; j++) {
        if (piecePos.row-2 >= 0) {
            if (j != 0 && piecePos.col+j >= 0 && piecePos.col+j < 8) {
                position = {
                    row: piecePos.row-2,
                    col: piecePos.col+j
                }

                if (getPieceColorAtPos(position, currBoard) != color) {
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            continue
                        }
                    }
                    legalMoves.push(position)
                }
            }
        }
    }

    for (let j= -1; j<2; j++) {
        if (piecePos.col+2 < 8) {
            if (j != 0 && piecePos.row+j >= 0 && piecePos.row+j < 8) {
                position = {
                    row: piecePos.row+j,
                    col: piecePos.col+2
                }

                if (getPieceColorAtPos(position, currBoard) != color) {
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            continue
                        }
                    }
                    legalMoves.push(position)
                }
            }
        }
    }

    for (let j = -1; j<2; j++) {
        if (piecePos.col-2 >= 0) {
            if (j != 0 && piecePos.row+j >= 0 && piecePos.row+j < 8) {
                position = {
                    row: piecePos.row+j,
                    col: piecePos.col-2
                }

                if (getPieceColorAtPos(position, currBoard) != color) {
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            continue
                        }
                    }
                    legalMoves.push(position)
                }
            }
        }
    }
    break

    case 'b':           // bishop

        for (let j = 1; j<8; j++) {             // up+right
            if (piecePos.row+j<8 && piecePos.col+j < 8) {
                position = {
                    row: piecePos.row+j,
                    col: piecePos.col+j
                }

                let clr = getPieceColorAtPos(position, currBoard)

                if (clr != color) {
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                                break
                            }
                            else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                                continue
                            }
                        }
                    }
                    legalMoves.push(position)

                    if (clr) {
                        break
                    }
                }
                else {
                    break
                }
        }
        else {
            break
        }
    }

    for (let j = 1; j<8; j++) {             // down+right
        if (piecePos.row-j >= 0 && piecePos.col+j < 8) {
            position = {
                row: piecePos.row-j,
                col: piecePos.col+j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }

    for (let j = 1; j<8; j++) {             // up+left
        if (piecePos.row+j < 8 && piecePos.col-j >= 0) {
            position = {
                row: piecePos.row+j,
                col: piecePos.col-j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }

    for (let j = 1; j<8; j++) {             // down+left
        if (piecePos.row-j >= 0 && piecePos.col-j >= 0) {
            position = {
                row: piecePos.row-j,
                col: piecePos.col-j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }
    break

    case 'r':           // rook

        for (let j = piecePos.row+1; j<8; j++) {        // UP

            position = {
                row: j,
                col: piecePos.col
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.row-1; j >= 0; j--) {  // DOWN
            position = {
                row: j,
                col: piecePos.col
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.col+1; j < 8; j++) {  // RIGHT
            position = {
                row: piecePos.row,
                col: j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.col-1; j >= 0; j--) {  // LEFT
            position = {
                row: piecePos.row,
                col: j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }
        break

        case 'q':

        // rook stuff:

        for (let j = piecePos.row+1; j<8; j++) {        // UP

            position = {
                row: j,
                col: piecePos.col
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.row-1; j >= 0; j--) {  // DOWN
            position = {
                row: j,
                col: piecePos.col
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.col+1; j < 8; j++) {  // RIGHT
            position = {
                row: piecePos.row,
                col: j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        for (let j = piecePos.col-1; j >= 0; j--) {  // LEFT
            position = {
                row: piecePos.row,
                col: j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
        }

        // bishop stuff

        for (let j = 1; j<8; j++) {             // up+right
            if (piecePos.row+j<8 && piecePos.col+j < 8) {
                position = {
                    row: piecePos.row+j,
                    col: piecePos.col+j
                }

                let clr = getPieceColorAtPos(position, currBoard)

                if (clr != color) {
                    if (chessCheck) {
                        if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                            if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                                break
                            }
                            else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                                continue
                            }
                        }
                    }
                    legalMoves.push(position)

                    if (clr) {
                        break
                    }
                }
                else {
                    break
                }
        }
        else {
            break
        }
    }

    for (let j = 1; j<8; j++) {             // down+right
        if (piecePos.row-j >= 0 && piecePos.col+j < 8) {
            position = {
                row: piecePos.row-j,
                col: piecePos.col+j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }

    for (let j = 1; j<8; j++) {             // up+left
        if (piecePos.row+j < 8 && piecePos.col-j >= 0) {
            position = {
                row: piecePos.row+j,
                col: piecePos.col-j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }

    for (let j = 1; j<8; j++) {             // down+left
        if (piecePos.row-j >= 0 && piecePos.col-j >= 0) {
            position = {
                row: piecePos.row-j,
                col: piecePos.col-j
            }

            let clr = getPieceColorAtPos(position, currBoard)

            if (clr != color) {
                if (chessCheck) {
                    if (tryMoveAndCheckIfChess(piecePos, position, color)) {
                        if (clr) {  // wenn piece auf position steht, ist das der letzte valide move in der diagonalen -> break
                            break
                        }
                        else {  // wenn feld frei kann naechstes feld in der diagonalen valid sein -> continue
                            continue
                        }
                    }
                }
                legalMoves.push(position)

                if (clr) {
                    break
                }
            }
            else {
                break
            }
    }
    else {
        break
        }
    }
    break

    case "k":   // king

        if (color === "w" && whiteCanCastle) {              // castling king side
            if (!wKRookMoved && currBoard[0][5] === "" && currBoard[0][6] === "") {
                position = {
                    row: piecePos.row,
                    col: piecePos.col+2
                }

                let illegalMove = false     // test for castling while being in check

                let opMoves = getAllPossibleMovesOfPlayer("b", board)

                for (let move of opMoves) {
                    if (move.row === 0 && move.col === 4) {
                        illegalMove = true
                    }
                }
                                       
                let testPos = {             // test for castling through / into a check
                    row: piecePos.row,  
                    col: piecePos.col+1
                }

                let boardAfterTest = tryMoveAndReturnBoard(piecePos, testPos)
                let opMovesAfterTest = getAllPossibleMovesOfPlayer("b", boardAfterTest)

                for (let move of opMovesAfterTest) {
                    if (move.row === 0 && move.col === 5) {
                        illegalMove = true
                    }
                }

                let boardAfterMove = tryMoveAndReturnBoard(piecePos, position)
                let opMovesAfterMove = getAllPossibleMovesOfPlayer("b", boardAfterMove)

                for (let move of opMovesAfterMove) {
                    if (move.row === 0 && move.col === 6) {
                        illegalMove = true
                    }
                }

                if (!illegalMove) {
                    legalMoves.push(position)
                }
            }

            if (!wQRookMoved && currBoard[0][1] === "" && currBoard[0][2] === "" && currBoard[0][3] === "") {       // castling queen side
                position = {
                    row: piecePos.row,
                    col: piecePos.col-2
                }

                let illegalMove = false
                let opMoves = getAllPossibleMovesOfPlayer("b", board)

                for (let move of opMoves) {
                    if (move.row === 0 && move.col === 4) {
                        illegalMove = true
                    }
                }

                let testPos = {
                    row: piecePos.row,
                    col: piecePos.col-1
                }

                let boardAfterTest = tryMoveAndReturnBoard(piecePos, testPos)
                let opMovesAfterTest = getAllPossibleMovesOfPlayer("b", boardAfterTest)

                for (let move of opMovesAfterTest) {
                    if (move.row === 0 && move.col === 3) {
                        illegalMove = true
                    }
                }

                let boardAfterMove = tryMoveAndReturnBoard(piecePos, position)
                let opMovesAfterMove = getAllPossibleMovesOfPlayer("b", boardAfterMove)

                for (let move of opMovesAfterMove) {
                    if (move.row === 0 && move.col === 2) {
                        illegalMove = true
                    }
                }

                if (!illegalMove) {
                    legalMoves.push(position)
                }
            }
        }

        else if (color === "b" && blackCanCastle) {           // black castling
                if (!bKRookMoved && currBoard[7][5] === "" && currBoard[7][6] === "") {    // black castling king side
                    position = {
                        row: piecePos.row,
                        col: piecePos.col+2
                    }
    
                    let illegalMove = false     // test for castling while being in check
    
                    let opMoves = getAllPossibleMovesOfPlayer("w", board)
    
                    for (let move of opMoves) {
                        if (move.row === 7 && move.col === 4) {
                            illegalMove = true
                        }
                    }
                                           
                    let testPos = {             // test for castling through / into a check
                        row: piecePos.row,  
                        col: piecePos.col+1
                    }
    
                    let boardAfterTest = tryMoveAndReturnBoard(piecePos, testPos)
                    let opMovesAfterTest = getAllPossibleMovesOfPlayer("w", boardAfterTest)
    
                    for (let move of opMovesAfterTest) {
                        if (move.row === 7 && move.col === 5) {
                            illegalMove = true
                        }
                    }
    
                    let boardAfterMove = tryMoveAndReturnBoard(piecePos, position)
                    let opMovesAfterMove = getAllPossibleMovesOfPlayer("w", boardAfterMove)
    
                    for (let move of opMovesAfterMove) {
                        if (move.row === 7 && move.col === 6) {
                            illegalMove = true
                        }
                    }
    
                    if (!illegalMove) {
                        legalMoves.push(position)
                    }
                }
    
                if (!bQRookMoved && currBoard[7][1] === "" && currBoard[7][2] === "" && currBoard[7][3] === "") {       // castling queen side
                    position = {
                        row: piecePos.row,
                        col: piecePos.col-2
                    }
    
                    let illegalMove = false
                    let opMoves = getAllPossibleMovesOfPlayer("w", board)
    
                    for (let move of opMoves) {
                        if (move.row === 7 && move.col === 4) {
                            illegalMove = true
                        }
                    }
    
                    let testPos = {
                        row: piecePos.row,
                        col: piecePos.col-1
                    }
    
                    let boardAfterTest = tryMoveAndReturnBoard(piecePos, testPos)
                    let opMovesAfterTest = getAllPossibleMovesOfPlayer("w", boardAfterTest)
    
                    for (let move of opMovesAfterTest) {
                        if (move.row === 7 && move.col === 3) {
                            illegalMove = true
                        }
                    }
    
                    let boardAfterMove = tryMoveAndReturnBoard(piecePos, position)
                    let opMovesAfterMove = getAllPossibleMovesOfPlayer("w", boardAfterMove)
    
                    for (let move of opMovesAfterMove) {
                        if (move.row === 7 && move.col === 2) {
                            illegalMove = true
                        }
                    }
    
                    if (!illegalMove) {
                        legalMoves.push(position)
                    }
                }
        }
//xx
        for (let t = -1; t<2; t++) {        // regular king moves
            if (t == 0) {
                if (piecePos.col-1 >= 0 && piecePos.col-1 < 8) {
                    position = {
                        row: piecePos.row,
                        col: piecePos.col-1
                    }

                    if (getPieceColorAtPos(position, currBoard) != color) {
                        if (chessCheck) {
                            if (!tryMoveAndCheckIfChess(piecePos, position, color)) {
                                legalMoves.push(position)
                            }
                        }
                        else {
                            legalMoves.push(position)
                        }
                    }
                }

                if (piecePos.col+1 >= 0 && piecePos.col+1 < 8) {
                    position = {
                        row: piecePos.row,
                        col: piecePos.col+1
                    }

                    if (getPieceColorAtPos(position, currBoard) != color) {
                        if (chessCheck) {
                            if (!tryMoveAndCheckIfChess(piecePos, position, color)) {
                                legalMoves.push(position)
                            }
                        }
                        else {
                            legalMoves.push(position)
                        }
                    }
                }
            }
            else {
                if (piecePos.row+t >= 0 && piecePos.row+t < 8) {
                    for (let k = -1; k<2; k++) {
                        if (piecePos.col+k >= 0 && piecePos.col+k < 8) {
                        position = {
                            row: piecePos.row+t,
                            col: piecePos.col+k
                        }
    
                        if (getPieceColorAtPos(position, currBoard) != color) {
                            if (chessCheck) {
                                if (!tryMoveAndCheckIfChess(piecePos, position, color)) {
                                    legalMoves.push(position)
                                }
                            }
                            else {
                                legalMoves.push(position)
                            }
                        }
                    }
                }
            }
            else {
                continue
            }
        }
    }
    break
}
return legalMoves
}

function tryMoveAndReturnBoard(piecePos, newPos) {
    let testBoard = [["", "", "", "", "", "", "",""],   // create temporary board
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "", "", "", "",""],
    ["", "", "", "","","", "" ,""],
    ["", "", "", "","","", "" ,""]
    ]

    for (let i=0; i<board.length; i++) {        // fill up with original piece positions
        for (let j=0; j<board.length; j++) {
            testBoard[i][j] = board[i][j]
        }
    }

    testBoard[newPos.row][newPos.col] = testBoard[piecePos.row][piecePos.col]   // zug auf testBoard spielen
    testBoard[piecePos.row][piecePos.col] = ""

    return testBoard
}

function isPieceonField(position, currBoard) {
    if(currBoard[position.row][position.col]) {
        return true
    }
    else {
        return false
    }
}

function getPieceColorAtPos(position, board) {
    let piece = board[position.row][position.col]
    return piece.charAt(0)
}

function tryMoveAndCheckIfChess(piecePos, newPos, color) {
    let tempBoard = [["", "", "", "", "", "", "",""], // temp 2. spielfeld wird erstellt
        ["", "", "", "", "", "", "",""],
        ["", "", "", "", "", "", "",""],
        ["", "", "", "", "", "", "",""],
        ["", "", "", "", "", "", "",""],
        ["", "", "", "", "", "", "",""],
        ["", "", "", "","","", "" ,""],
        ["", "", "", "","","", "" ,""]
    ]

    for(let i = 0; i < board.length; i++) { // echtes momentanes rein copien
        for(let j = 0; j < board[i].length; j++) {
            tempBoard[i][j] = board[i][j];
        }
    }

    tempBoard[newPos.row][newPos.col] = tempBoard[piecePos.row][piecePos.col] // piece wird auf 2. temp spielfeld bewegt / zug wird dort gespielt
    tempBoard[piecePos.row][piecePos.col] = ""

    // jetzt checken ob spieler dadurch selbst ins schach setzt / immernoch im schach steht
    return isPlayerInChess(color, tempBoard)
}

function isPlayerInChess(player, currBoard) {
    let op
    if(player === "w") {
        op = "b"
    } else {
        op = "w"
    }

    chessCheck = false
    let possibleMoves = getAllPossibleMovesOfPlayer(op, currBoard)
    let kingPos = getKingPosOfPlayer(player, currBoard)
    chessCheck = true

    for (let move of possibleMoves) { // checken ob einer aller possible moves mit der position des kings uebereinstimmt = check vorhanden
        if (move.row === kingPos.row && move.col === kingPos.col) {
            return true
        }
    } // wenn dies nicht der fall ist, ist demnach kein check vorhanden
    return false
}

function getAllPossibleMovesOfPlayer(player, currBoard) {
    let alivePiecesOfPlayer = getAllAlivePiecesOfPlayer(player, currBoard)
    let possibleMoves = []

    for (let piece of alivePiecesOfPlayer) { // position, type und legale moves von jedem alive Piece des spielers werden geholt
        let posi = givePosition(currBoard, piece)
        let type = getPieceType(piece)
        let moves = getLegalMoves(posi, type, currBoard)
        for (let move of moves) { // alle legalen moves die in array von getLegalMoves returned werden, werden each in possibleMoves gepushed
            possibleMoves.push(move)
        }
    }
    return possibleMoves
}

function getAllAlivePiecesOfPlayer(player, currBoard) {
    let alivePiecesOfPlayer = []
    for (let i=0; i<currBoard.length; i++) {
        for (let j=0; j<currBoard[i].length; j++) {
            if(currBoard[i][j].startsWith(player)) {
                alivePiecesOfPlayer.push(currBoard[i][j])
            }
        }
    }
    return alivePiecesOfPlayer
}

function getKingPosOfPlayer(player, currBoard) {
    for (let i=0; i<currBoard.length; i++) {
        for (let j=0; j<currBoard[i].length; j++) {
            if (currBoard[i][j] == player + "k") {
                return {
                    row: i,
                    col: j
                }
            }
        }
    }
}

function markLegalMoves(positions) { // nimmt ein array von legalen moves auf und setzt fuer jeden einen punkt auf die jeweilige position
    for (let position of positions) {
        let boardPosition = getFieldFromPosition(position)
        markedMoves.push(boardPosition)

        let field = document.getElementById(boardPosition)

        if (isPieceonField(position, board)) {
            field.classList.add("catch")
        }

        let dot = document.createElement("div")
        dot.classList.add("marker")
        dot.setAttribute("onclick", "movePiece(this)")
        dot.innerHTML = "•"

        field.appendChild(dot)
    }
}

/* when you click on a piece, it calls a function that RETURNS all possible moves for that type of piece,
   you can then click on any square on the board, if it matches with a possible move inside the array, returned from the function, move there
- i can break out of a for loop when checking moves, while going through the squares until the maximum possible distance in any direction
- for example -9 * i would give me all in a diagonal
- and until i break i just add the legal css class to every square until i 'hit' something

- issue is that my entire board is just a 1 dimensional array, whereas the piece coordinates should actually be 2 dimensional, for calculations to work properly, x and y axis
- similar to connect 4
- 


*/

createGame()