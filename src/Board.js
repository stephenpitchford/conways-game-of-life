import React, { Component } from 'react';

const RANDOM_ALIVE_CHANCE = .25;
const BOARD_WIDTH = 60;
const BOARD_HEIGHT = 60;

export class Board extends Component {
  constructor() {
    this.rows = BOARD_HEIGHT;
    this.columns = BOARD_WIDTH;

    let gridData = this.initialiseGrid();

    this.state = {
      intervalId: null,
      generations: 0,
      grid: gridData.grid,
      population: gridData.population
    }; 

    this.pauseGame = this.pauseGame.bind(this);
    this.randomiseGame = this.randomiseGame.bind(this);
    this.setAlive = this.setAlive.bind(this);
    this.startGame = this.startGame.bind(this);
    this.stopGame = this.stopGame.bind(this);
  }

  initialiseGrid(shouldRandomise = false) {
    let grid = [],
        population = 0;

    for (let i = 0; i < this.rows; i++) {
      grid[i] = [];
      for (let j = 0; j < this.columns; j++) {
        if (shouldRandomise) {
          let value = Math.random() < RANDOM_ALIVE_CHANCE ? 1 : 0;

          grid[i][j] = value;
          population += value;
        } else {
          grid[i][j] = 0;
        }
      }
    }

    return { grid, population };
  }

  getColumns(rowIndex) {
    let columns = [];

    for (let i = 0; i < this.columns; i++) {
      let isCellAlive = this.state.grid[rowIndex][i],
          className = isCellAlive ? 'alive': '';

      columns.push(
        <div className={`column ${className}`} 
             onClick={this.setAlive} 
             key={i.toString()} 
             data-column-id={i} 
             data-row-id={rowIndex}></div>
      );
    }

    return columns;
  }

  getRows() {
    let rows = [];

    for (let i = 0; i < this.rows; i++) {
      rows.push(
        <div className="row" 
             key={i.toString()}>{this.getColumns(i)}</div>
      );
    }

    return rows;
  }

  pauseGame() {
    if (!this.state.intervalId) { return; }

    window.clearInterval(this.state.intervalId);

    this.setState({ intervalId: null });
  }

  randomiseGame() {
    // Don't randomise while the game is running
    if (this.state.intervalId) { return; }

    let gridData = this.initialiseGrid(true);

    this.setState({
      generations: 0,
      grid: gridData.grid,
      population: gridData.population
    })
  }

  _getAliveState(grid, rowId, columnId) {
    if (!grid[rowId]) { return 0; }
    if (!grid[rowId][columnId]) { return 0; }

    return 1;
  }

  _getAliveNeighbourCount(grid, i, j) {
    let aliveNeighbourCount = 0;

    aliveNeighbourCount += this._getAliveState(grid, i - 1, j - 1);
    aliveNeighbourCount += this._getAliveState(grid, i - 1, j);
    aliveNeighbourCount += this._getAliveState(grid, i - 1, j + 1);
    aliveNeighbourCount += this._getAliveState(grid, i, j - 1);
    aliveNeighbourCount += this._getAliveState(grid, i, j + 1);
    aliveNeighbourCount += this._getAliveState(grid, i + 1, j - 1);
    aliveNeighbourCount += this._getAliveState(grid, i + 1, j);
    aliveNeighbourCount += this._getAliveState(grid, i + 1, j + 1);

    return aliveNeighbourCount;
  }

  _intervalFunction() {
    let population = 0,
        originalGrid = this.state.grid,
        grid = originalGrid.map(row => row.slice());

    for(let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        let aliveNeighbourCount = this._getAliveNeighbourCount(originalGrid, i, j);

        if (originalGrid[i][j] && (aliveNeighbourCount < 2 || aliveNeighbourCount > 3)) {
          /**
           * - Any live cell with fewer than two live neighbours dies, as if caused by underpopulation.
           * - Any live cell with more than three live neighbours dies, as if by overpopulation.
           */
          grid[i][j] = 0;
        } else if(aliveNeighbourCount === 3) {
          /**
           * - Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.
           */
          grid[i][j] = 1;
          population++;
        }
      }
    }

    this.setState({
      generations: this.state.generations + 1,
      grid,
      population
    });
  }

  startGame() {
    let intervalId = window.setInterval(this._intervalFunction.bind(this), 500);

    this.setState({ intervalId });
  }

  stopGame() {
    if (!this.state.intervalId) { return; }

    window.clearInterval(this.state.intervalId);

    let gridData = this.initialiseGrid();

    this.setState({
      intervalId: null,
      generations: 0,
      grid: gridData.grid,
      population: 0
    })
  }

  setAlive(e) {
    let { rowId, columnId} = e.target.dataset,
        grid = this.state.grid,
        population = this.state.population;

    grid[rowId][columnId] = grid[rowId][columnId] ? 0 : 1;
    
    if (grid[rowId][columnId]) {
      population += 1;
    }

    this.setState({
      grid,
      population
    });
  }

  componentWillUnmount() {
    if (this.state.intervalId) {
      window.clearInterval(this.state.intervalId);
    }
  }

  render() {
    return (
      <div className="game">
        <header>
        <h1>Conway's Game of Life</h1>
        <p>This is an implementation of Conway's Game of Life written in React. An explanation of what this is can be found here: <a href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life" target="_blank">https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life</a></p>
        </header>
        <div className="board-container">
          <button onClick={this.startGame} disabled={this.state.population === 0 || this.state.intervalId}>Start</button>
          <button onClick={this.pauseGame} disabled={!this.state.intervalId}>Pause</button>
          <button onClick={this.stopGame} disabled={!this.state.intervalId}>Stop</button>
          <button onClick={this.randomiseGame} disabled={this.state.intervalId}>Randomise</button>
          <div className="generation-count">Generations: {this.state.generations}</div>
          <div className="population-count">Population: {this.state.population}</div>
          <div className="board">
            {this.getRows()}    
          </div>
        </div>
      </div>
    )
  }
}
