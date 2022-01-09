class CheckerOpponent {
    constructor(board, color, clickOnPlayerSquare, resetClicks, game) {
        this.board = board
        this.COLOR = color
        this.clickOnPlayerSquare = clickOnPlayerSquare
        this.resetClicks = resetClicks
        this.selectedFig = null
        this.running = true
    }
    updateBoard(board) {
        this.board = board
    }

    async findLegalMoves() {
        const legalMoves = []
        let squaresOwned = []
        await this.board.forEach(row => {
            const owned = row.filter(square => square.player === this.COLOR)
            squaresOwned.push(owned)
        });
        squaresOwned = squaresOwned.filter(rows => rows.length > 0)
        squaresOwned.forEach(async(ownedRows) => {
            console.log(ownedRows)
            await ownedRows.forEach(async(square) => {
                const legalRow = {
                    row: [],
                    square: square
                }
                await this.board.forEach(row => {
                    this.resetClicks()
                    this.clickOnPlayerSquare(square.x, square.y, square.isKing)
                    const tmp = row.filter(isLegal => isLegal.isChoice && isLegal.player === null)
                    console.log('makeable moves', tmp, ' with', square)
                    tmp.forEach(elm => {
                        console.log('move', elm)
                        legalRow.row.push(Object.assign({}, elm))
                    })
                })
                if (legalRow.row.length > 0) {
                    legalMoves.push(legalRow)
                }
            })
        })
        return legalMoves
    }

    async chooseMove() {
        const priorityMoves = []
        const legal = await this.findLegalMoves()
        console.log('legalmoves', legal)
        let chosenSquare = null
        for (let choice of legal) {
            for (const currentSquare of choice.row) {
                const targetSquare = this.board[currentSquare.y][currentSquare.x]

                if (this.becomeKing(choice.square) && targetSquare.y === this.board.length - 1) {
                    chosenSquare = targetSquare
                    break
                }


                console.log('check if can kill', choice.square)
                if (this.checkAttack(choice.square.x, choice.square.y, targetSquare.x, targetSquare.y)) {
                    console.log('attack with', choice.square, 'over to ', targetSquare)
                    this.clickOnPlayerSquare(choice.square.x, choice.square.y, choice.square.isKing)
                    chosenSquare = targetSquare
                    console.log('can kill')
                    break
                }
            }
            if (chosenSquare) {
                this.selectedFig = choice.square
                break
            }

        }
        if (chosenSquare !== null) {
            return chosenSquare
        }
        console.log('can`t kill')
        let randomStep = Math.floor(Math.random() * legal.length)
        const choice = legal[randomStep]
        const choicesForFig = await choice.row.filter(entry => entry.isChoice && entry.player === null)
        randomStep = Math.floor(Math.random() * choicesForFig.length)
        chosenSquare = choicesForFig[randomStep]
        console.log('stepping with', choice.square, 'over to ', chosenSquare)
        this.clickOnPlayerSquare(choice.square.x, choice.square.y, choice.square.isKing)
        this.selectedFig = choice.square
        return chosenSquare

    }

    checkAttack(startX, startY, endX, endY) {
        if (startX > endX && startY > endY) //Sprung nach oben links
        {

            if (this.board[endY + 1][endX + 1].player !== this.COLOR && this.board[endY + 1][endX + 1].player !== null) {
                return true
            }
        } else if (startX < endX && startY > endY) //Sprung nach oben rechts
        {
            if (this.board[endY + 1][endX - 1].player !== null && this.board[endY + 1][endX - 1].player !== this.COLOR) {
                return true
            }

        } else if (startX > endX && startY < endY) //Sprung nach unten links
        {
            if (this.board[endY - 1][endX + 1].player !== null && this.board[endY - 1][endX + 1].player !== this.COLOR) {
                return true
            }

        } else if (startX < endX && startY < endY) //Sprung nach unten rechts
        {
            if (this.board[endY - 1][endX - 1].player !== null && this.board[endY - 1][endX - 1].player !== this.COLOR)
                return true
        }
        return false

    }

    becomeKing(square) {
        if (square.y === this.board.length - 2 && (this.board[this.board.length - 1][square.x - 1].player === null || this.board[this.board.length - 1][square.x + 1].player === null)) {
            return true
        }
        return false
    }

}