angular.module('ngCheckers', [])

.controller('checkersCtrl', function($scope, $timeout) {
    var RED = "Rot",
        BLACK = "Schwarz",
        BOARD_WIDTH = 8,
        selectedSquare = null;

    function Piece(player, x, y) {
        this.player = player; //Welchem Spieler gehört der Spielstein?
        this.x = x; //Koordinate x
        this.y = y; //Koordinate y
        this.isKing = false; //Ist ein Spielstein eine Dame?
        this.isChoice = false; //Ist ein Feld eine Auswahlmöglichkeit? Wird grün markiert
    }
    //Erstellt das Spielfeld
    $scope.newGame = function() {


        $scope.player = RED; //Spieler wird gesetzt
        $scope.redScore = 0; //Punkte für Rot auf 0
        $scope.blackScore = 0; //Punkte für schwarz auf 0

        $scope.board = [];
        for (var i = 0; i < BOARD_WIDTH; i++) //Platziert die Steine
        {
            $scope.board[i] = [];
            for (var j = 0; j < BOARD_WIDTH; j++) {
                if ((i === 0 && j % 2 === 1) || (i === 1 && j % 2 === 0) || (i === 2 && j % 2 === 1)) //Platziert alle schwarzen Steine
                {
                    $scope.board[i][j] = new Piece(BLACK, j, i);
                } else if ((i === BOARD_WIDTH - 3 && j % 2 === 0) || (i === BOARD_WIDTH - 2 && j % 2 === 1) || (i === BOARD_WIDTH - 1 && j % 2 === 0)) //Platziert alle roten Steine
                {
                    $scope.board[i][j] = new Piece(RED, j, i);
                } else {
                    $scope.board[i][j] = new Piece(null, j, i); //Der Rest sind leere Felder
                }
            }
        }
        username = prompt("Bitte gib deinen Namen ein: ");
        if (username == null || username == "") {
            $scope.username = "Rot";
        } else {
            $scope.username = username;
        }
        console.log("Username: " + username);
        $scope.opponent = new CheckerOpponent($scope.board, BLACK, setChoices, resetChoices)
        $scope.aiOpponent = setInterval(async() => {
            if ($scope.player === BLACK) {
                $scope.opponent.updateBoard($scope.board)
                const movement = await $scope.opponent.chooseMove()
                const AI_MOVE = $scope.board[movement.y][movement.x]
                selectedSquare = $scope.board[$scope.opponent.selectedFig.y][$scope.opponent.selectedFig.x]
                console.log(selectedSquare)
                console.log(AI_MOVE)
                await move(AI_MOVE)
                $scope.opponent.selectedFig = null
                console.log('AI-Board after move', $scope.opponent.board)
                await resetChoices()
            }
        }, 1000)
    }
    $scope.newGame(); //Funktion wird aufgerufen und das Spielfeld wird erstellt

    $scope.setStyling = function(square) //Die Farben der Spielsteine werden gesetzt
        {
            if (square.player === RED) {
                return {
                    "backgroundColor": "#FF0000"
                }; //Die roten Spielsteine werden eingefärbt
            } else if (square.player === BLACK) {
                return {
                    "backgroundColor": "#A3A3A3"
                }; //Die schwarzen Spielsteine werden eingefärbt
            }
            return {
                "backgroundColor": "none"
            }; //Der Rest erhält keine Farbe
        }

    $scope.setClass = function(square) //Farbe der Felder wird gesetzt
        {
            if (square.y % 2 === 0) //Zeilen werden geprüft, nur gerade
            {
                if (square.x % 2 === 0) //Spalten werden geprüft, nur gerade
                {
                    return {
                        "backgroundColor": "white"
                    }; //Falls das Feld die Bewegungsmöglichkeit anzeigt ist es grün, sonst weiß
                } else {
                    return {
                        "backgroundColor": square.isChoice ? "green" : "black"
                    }; //Alle ungeraden Spalten werden schwarz
                }
            } //In jeder zweiten Zeile ist jede gerade x Koordinate weiß und jede ungerade schwarz
            else //Nun werden alle ungeraden Zeilen durchlaufen
            {
                if (square.x % 2 === 1) //Spalten werden geprüft, nur ungerade
                {
                    return {
                        "backgroundColor": "white"
                    }; //Falls das Feld die Bewegungsmöglichkeit anzeigt ist es grün, sonst weiß
                } else {
                    return {
                        "backgroundColor": square.isChoice ? "green" : "black"
                    }; //Alle anderen Felder werden schwarz
                }
            }
        }

    $scope.select = async function(square) {


        if (selectedSquare !== null && !square.player) //Wenn ein Feld existiert und keinen Spieler hat => leeres Feld
        {
            //movePiece(square); //Spielstein wird bewegt
            move(square);
            resetChoices(); //Auswahlfelder werden entfernt
        } else if (square.player === $scope.player) //Wenn das geklickte Feld ein anderer Spielstein vom gleichen Spieler ist
        {
            selectedSquare = square; //Der neue Spielstein wird zur Auswahl
            resetChoices(); //Die Auswahlfelder werden zurückgesetzt (vom alten Spielstein)
            setChoices(selectedSquare.x, selectedSquare.y, selectedSquare.isKing); //Die neuen Auswahlfelder werden gesetzt
        } else {
            selectedSquare = null; //Kein ausgewählter Spielstein
        }
        /*         if ($scope.player === BLACK) {
                    $scope.opponent.updateBoard($scope.board)
                    const movement = await $scope.opponent.chooseMove()
                    const AI_MOVE = $scope.board[movement.y][movement.x]
                    selectedSquare = $scope.board[$scope.opponent.selectedFig.y][$scope.opponent.selectedFig.x]
                    console.log(selectedSquare)
                    console.log(AI_MOVE)
                    await move(AI_MOVE)
                    $scope.opponent.selectedFig = null
                    console.log('AI-Board after move', $scope.opponent.board)
                    await resetChoices()
                } */

        console.log($scope.board); //Board wird in Konsole ausgegeben
    }


    async function resetChoices() //Auswahlfelder zurücksetzen
    {
        // Reset Choices
        for (var i = 0; i < BOARD_WIDTH; i++) {
            for (var j = 0; j < BOARD_WIDTH; j++) //Board-Array wird durchlaufen
            {
                $scope.board[i][j].isChoice = false; //Von allen Feldern wird der "Auswahlmöglichkeit"-Status entfernt
            }
        }
        $scope.opponent.updateBoard($scope.board)
    }

    async function move(square) {
        if (square.isChoice) {
            var king = selectedSquare.isKing || isKing(square);

            square.player = selectedSquare.player;
            square.isKing = king;
            checkAttack(selectedSquare.x, selectedSquare.y, square.x, square.y);
            selectedSquare.player = null;
            selectedSquare.isKing = false;
            if ($scope.redScore === 12) {
                gameOver(RED);
            } else if ($scope.blackScore === 12) {
                gameOver(BLACK);
            }
            $scope.player = $scope.player === RED ? BLACK : RED;
        }
    }

    function isKing(square) //Überprüft ob ein Spielstein(Feld) eine Dame ist
    {
        if ($scope.player === RED) //Falls der Spieler Rot ist
        {
            if (square.y === 0) //Falls das Feld am oberen Rand liegt
            {
                return true; //Feld ist Dame
            }
        } else //Wenn der Spieler nicht Rot ist, also Schwarz
        {
            if (square.y === BOARD_WIDTH - 1) //Falls das Feld am unteren Rand liegt
            {
                return true; //Feld ist Dame
            }
        }
        return false; //Ansonsten ist der Spielstein keine Dame
    }



    function becomeKingAfterJump(x, y) //Überprüft ob ein Spielstein nach einem Zug eine Dame wird
    {
        return ($scope.player === RED && y == 1) || ($scope.player === BLACK && y == BOARD_WIDTH - 2); //Falls der Spieler Rot ist und eins unter dem oberen Rand ist oder schwarz und eins über dem untersten Rand ist
    }

    function setChoices(x, y, isKing) //Auswahlfelder werden gesetzt
    {
        isKing = isKing || ($scope.player === RED && y == 0) || ($scope.player === BLACK && y == BOARD_WIDTH - 1); //Falls der Spielstein ein König ist oder er beim jeweiligen Spieler in der letzten Reihe des Felds steht

        if (isKing) {
            if (y === 0) {
                if (x === 0) {
                    checkBottomRightKing(x, y);
                } else if (x === 7) {
                    checkBottomLeftKing(x, y);
                } else {
                    checkBottomRightKing(x, y);
                    checkBottomLeftKing(x, y);
                }
            } else if (y === 7) {
                if (x === 0) {
                    checkTopRightKing(x, y);
                } else if (x === 7) {
                    checkTopLeftKing(x, y);
                } else {
                    checkTopRightKing(x, y);
                    checkTopLeftKing(x, y);
                }
            } else {
                if (x === 0) {
                    checkTopRightKing(x, y);
                    checkBottomRightKing(x, y);
                } else if (x === 7) {
                    checkTopLeftKing(x, y);
                    checkBottomLeftKing(x, y);
                } else {
                    checkTopRightKing(x, y);
                    checkBottomRightKing(x, y);
                    checkTopLeftKing(x, y);
                    checkBottomLeftKing(x, y);
                }
            }
        }

        if ($scope.player === RED) {
            if (y > 0) {
                if (x === 0) {
                    checkTopRight(x, y);
                } else if (x === 7) {
                    checkTopLeft(x, y);
                } else {
                    checkTopRight(x, y);
                    checkTopLeft(x, y);
                }
            }
        }

        if ($scope.player === BLACK) {
            if (y < 7) {
                if (x === 0) {
                    checkBottomRight(x, y);
                } else if (x === 7) {
                    checkBottomLeft(x, y);
                } else {
                    checkBottomRight(x, y);
                    checkBottomLeft(x, y);
                }
            }
        }
        selectedSquare = $scope.board[y][x]
        console.log(selectedSquare)
    }

    function checkTopRight(x, y) {
        if (y > 0) {
            if ($scope.board[y - 1][x + 1].player === null) //Oben rechts = freies Feld
            {
                $scope.board[y - 1][x + 1].isChoice = true; //Freies Feld oben rechts wird Auswahl
            } else //Oben rechts liegt ein Spieler
            {
                if ($scope.board[y - 1][x + 1].player !== $scope.player) //Oben rechts liegt ein Gegner
                {
                    if (x < 6 && y > 1) //Wenn rechts hinter dem Gegner noch Platz ist
                    {
                        if ($scope.board[y - 2][x + 2].player === null) //Wenn hinter dem Gegner das Feld frei ist
                        {
                            $scope.board[y - 2][x + 2].isChoice = true; //Feld hinter Gegner wird ausgewählt
                        }
                    }
                }
            }
        }
    }

    function checkTopLeft(x, y) {
        if ($scope.board[y - 1][x - 1].player === null) //Oben links = freies Feld
        {
            $scope.board[y - 1][x - 1].isChoice = true; //Freies Feld oben links wird Auswahl
        } else //Oben links liegt ein Spieler
        {
            if ($scope.board[y - 1][x - 1].player !== $scope.player) //Oben links liegt ein Gegner
            {
                if (x > 1 && y > 1) //Wenn links hinter dem Gegner noch Platz ist 
                {
                    if ($scope.board[y - 2][x - 2].player === null) //Wenn hinter dem Gegner das Feld frei ist
                    {
                        $scope.board[y - 2][x - 2].isChoice = true; //Feld hinter Gegner wird ausgewählt
                    }
                }
            }
        }
    }

    function checkBottomRight(x, y) {
        if ($scope.board[y + 1][x + 1].player === null) //Unten rechts = freies Feld
        {
            $scope.board[y + 1][x + 1].isChoice = true; //Freies Feld unten rechts wird Auswahl
        } else //Unten rechts liegt ein Spieler
        {
            if ($scope.board[y + 1][x + 1].player !== $scope.player) //Unten rechts liegt ein Gegner
            {
                if (x < 6 && y < 6) {
                    if ($scope.board[y + 2][x + 2].player === null) //Wenn hinter dem Gegner das Feld frei ist
                    {
                        $scope.board[y + 2][x + 2].isChoice = true; //Feld hinter Gegner wird ausgewählt
                    }
                }
            }
        }
    }

    function checkBottomLeft(x, y) {
        if ($scope.board[y + 1][x - 1].player === null) //Unten links = freies Feld
        {
            $scope.board[y + 1][x - 1].isChoice = true; //Freies Feld unten links wird Auswahl
        } else //Unten links liegt ein Spieler
        {
            if ($scope.board[y + 1][x - 1].player !== $scope.player) //Unten links liegt ein Gegner
            {
                if (x > 1 && y < 6) {
                    if ($scope.board[y + 2][x - 2].player === null) //Wenn hinter dem Gegner das Feld frei ist
                    {
                        $scope.board[y + 2][x - 2].isChoice = true; //Feld hinter Gegner wird ausgewählt
                    }
                }
            }
        }
    }

    function checkTopRightKing(x, y) {
        if (x < 7 && y > 0) {
            if ($scope.board[y - 1][x + 1].player === null) //Oben rechts = freies Feld
            {
                $scope.board[y - 1][x + 1].isChoice = true;
                console.log("Oben rechts freies Feld. x: " + (x + 1) + ", y: " + (y - 1));
                checkTopRightKing(x + 1, y - 1);
            } else {
                console.log("Oben rechts Gegner. x: " + (x + 1) + ", y: " + (y - 1));
                checkTopRight(x, y);
            }
        }

    }

    function checkTopLeftKing(x, y) {
        if (x > 0 && y > 0) {
            if ($scope.board[y - 1][x - 1].player === null) //Oben links = freies Feld
            {
                $scope.board[y - 1][x - 1].isChoice = true;
                console.log("Oben links freies Feld. x: " + (x - 1) + ", y: " + (y - 1));
                checkTopLeftKing(x - 1, y - 1);
            } else {
                console.log("Oben links Gegner. x: " + (x - 1) + ", y: " + (y - 1));
                checkTopLeft(x, y);
            }
        }

    }

    function checkBottomRightKing(x, y) {
        if (x < 7 && y < 7) {
            if ($scope.board[y + 1][x + 1].player === null) //Unten rechts = freies Feld
            {
                $scope.board[y + 1][x + 1].isChoice = true;
                console.log("Unten rechts freies Feld. x: " + (x + 1) + ", y: " + (y + 1));
                checkBottomRightKing(x + 1, y + 1);
            } else {
                console.log("Unten rechts Gegner. x: " + (x + 1) + ", y: " + (y + 1));
                checkBottomRight(x, y);
            }
        }

    }

    function checkBottomLeftKing(x, y) {
        if (x > 0 && y < 7) {
            if ($scope.board[y + 1][x - 1].player === null) //Unten links = freies Feld
            {
                $scope.board[y + 1][x - 1].isChoice = true;
                console.log("Unten links freies Feld. x: " + (x - 1) + ", y: " + (y + 1));
                checkBottomLeftKing(x - 1, y + 1);
            } else {
                console.log("Unten links Gegner. x: " + (x - 1) + ", y: " + (y + 1));
                checkBottomLeft(x, y);
            }
        }

    }

    function checkAttack(startX, startY, endX, endY) //Überprüft ob ein Stein geschlagen wurde; Start: Der ausgewählte Spielstein, End: Das Zielfeld des Sprungs
    {
        if (startX > endX && startY > endY) //Sprung nach oben links
        {

            if ($scope.board[endY + 1][endX + 1].player !== null && $scope.board[endY + 1][endX + 1].player !== $scope.player) {
                $scope.board[endY + 1][endX + 1].player = null; //Übersprungener Stein wird entfernt
                $scope.board[endY + 1][endX + 1].isKing = false;
                $scope.player === RED ? $scope.redScore++ : $scope.blackScore++;
                console.log($scope.player + " hat einen Stein geschlagen");
                console.log("Rot: " + $scope.redScore + " -- Schwarz: " + $scope.blackScore);
            }
        } else if (startX < endX && startY > endY) //Sprung nach oben rechts
        {
            if ($scope.board[endY + 1][endX - 1].player !== null && $scope.board[endY + 1][endX - 1].player !== $scope.player) {
                $scope.board[endY + 1][endX - 1].player = null; //Übersprungener Stein wird entfernt
                $scope.board[endY + 1][endX - 1].isKing = false;
                $scope.player === RED ? $scope.redScore++ : $scope.blackScore++;
                console.log($scope.player + " hat einen Stein geschlagen");
                console.log("Rot: " + $scope.redScore + " -- Schwarz: " + $scope.blackScore);
            }

        } else if (startX > endX && startY < endY) //Sprung nach unten links
        {
            if ($scope.board[endY - 1][endX + 1].player !== null && $scope.board[endY - 1][endX + 1].player !== $scope.player) {
                $scope.board[endY - 1][endX + 1].player = null; //Übersprungener Stein wird entfernt
                $scope.board[endY - 1][endX + 1].isKing = false;
                $scope.player === RED ? $scope.redScore++ : $scope.blackScore++;
                console.log($scope.player + " hat einen Stein geschlagen");
                console.log("Rot: " + $scope.redScore + " -- Schwarz: " + $scope.blackScore);
            }

        } else if (startX < endX && startY < endY) //Sprung nach unten rechts
        {
            if ($scope.board[endY - 1][endX - 1].player !== null && $scope.board[endY - 1][endX - 1].player !== $scope.player) {
                $scope.board[endY - 1][endX - 1].player = null; //Übersprungener Stein wird entfernt
                $scope.board[endY - 1][endX - 1].isKing = false;
                $scope.player === RED ? $scope.redScore++ : $scope.blackScore++;
                console.log($scope.player + " hat einen Stein geschlagen");
                console.log("Rot: " + $scope.redScore + " -- Schwarz: " + $scope.blackScore);
            }

        }
    }


    function gameOver(player) //Ende des Spiels, Gameover-Alert anzeigen
    {
        if (player) //Wenn ein Spieler gewonnen hat
        {
            alert(player + " gewinnt!"); //Alert: Der Spieler hat gewonnen
        } else //Falls kein Spieler gewonnen hat
        {
            alert("Unentschieden"); //Alert: Unentschieden
        }
    }

    function changePlayer() {
        $scope.player = $scope.player === RED ? BLACK : RED;
    }

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

});