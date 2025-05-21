var mode = "easy";
var clicks = 0;
var pairsLeft = 0;
var totalPairs = 0;
var pairsMatched = 0;
var timeRemaining = 90;
var gameTime;

function changeMode(difficulty) {
  mode = difficulty;
  reset();
  displayHeader();
}


async function setup(mode) {
  reset();
  $("#game_grid").empty();
  switch (mode) {
    case "easy":
      await getPokemon(4);
      if ($("#game_grid").hasClass("hard")) {
        $("#game_grid").removeClass("hard");
      }
      reset();
      gameTime = setInterval(function() {
        decrement(timeRemaining, "timeRemaining");
      }, 1000);
      break;
    case "normal":
      await getPokemon(8);
      if ($("#game_grid").hasClass("hard")) {
        $("#game_grid").removeClass("hard");
      }
      reset();
      gameTime = setInterval(function () {
        decrement(timeRemaining, "timeRemaining");
      }, 1000);
      break;
    case "hard":
      await getPokemon(12);
      if (! $("#game_grid").hasClass("hard")) {
        $("#game_grid").addClass("hard");
      }
      reset();
      gameTime = setInterval(function () {
        decrement(timeRemaining, "timeRemaining");
      }, 1000);
      break;
    default:
      break;
  }
  if ($(".card").hasClass("flip")) {
    $(".card").removeClass("flip");
  }
  let firstCard = undefined
  let secondCard = undefined
  let flipping = false;
  $(".card").on(("click"), function () {
    if (!$(this).hasClass("flip") && flipping == false) {
      $(this).toggleClass("flip");
    }
    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0];
      increment(clicks, "clicks");
    }
    else if(!secondCard) {
      if ($(this).find(".front_face")[0] != firstCard) {
        secondCard = $(this).find(".front_face")[0];
        increment(clicks, "clicks");
        if (
          firstCard.src
          ==
          secondCard.src
        ) {
          console.log("match")
          $(`#${firstCard.id}`).parent().off("click")
          $(`#${secondCard.id}`).parent().off("click")
          increment(pairsMatched, "pairsMatched");
          decrement(pairsLeft, "pairsLeft");
          firstCard = undefined
          secondCard = undefined
          if (totalPairs == pairsMatched) {
            console.log("you win!");
            $(".victory").addClass("show");
            clearInterval(gameTime);
          }
        } else {
          console.log("no match")
          if (flipping != true) {
            // powerup logic: last 30 seconds, if match wrong, click on powerup to reveal all cards
            setTimeout(() => {
              $(`#${firstCard.id}`).parent().toggleClass("flip");
              $(`#${secondCard.id}`).parent().toggleClass("flip");
              if (timeRemaining <= 30 && !$("#powerup").hasClass("used")) {
                $("#powerup").addClass("show")
              }
            }, 1000)
            flipping = true
            setTimeout(() => {
              flipping = false;
              firstCard = undefined
              secondCard = undefined
            }, 2000)
          }
        }
      }
    }
  });
}

// stops cards from being flipped
function stopFlip() {
  $(".card").off("click");
}

// will reset game
function reset() {
  if($(".card").hasClass("flip")) {
    $(".card").removeClass("flip");
  }
  if ($("#powerup").hasClass("used")) {
    $("#powerup").removeClass("used");
  }
  clicks = 0;
  pairsLeft = mode == "easy" ? 4 : mode == "normal" ? 8 : mode == "hard" ? 12 : 0;
  totalPairs = mode == "easy" ? 4 : mode == "normal" ? 8 : mode == "hard" ? 12 : 0;
  pairsMatched = 0;
  timeRemaining = mode == "easy" ? 180 : mode == "normal" ? 120 : mode == "hard" ? 90 : 90;
  displayHeader();
  clearInterval(gameTime);
  stopFlip();
  if ($(".victory").hasClass("show")) {
    $(".victory").removeClass("show");
  }
  if ($(".defeat").hasClass("show")) {
    $(".defeat").removeClass("show");
  }
}

function powerup() {
  $("#powerup").removeClass("show");
  $("#powerup").addClass("used");
  $(".screen_block").addClass("show");
  setTimeout(() => {
    $(".screen_block").removeClass("show");
  }, 3000)
  $(".card").each(function() {
    if(!$(this).hasClass("flip")) {
      $(this).addClass("powerup_flip");
      setTimeout(() => {
        $(this).removeClass("powerup_flip")
      }, 3000)
    }
  })
}

// displays the header
function displayHeader() {
  $(".timeRemaining").html(timeRemaining);
  $(".clicks").html(clicks);
  $(".pairsLeft").html(pairsLeft);
  $(".totalPairs").html(totalPairs);
  $(".pairsMatched").html(pairsMatched);
}

// decrement function that will change global variables
function decrement(x, string) {
  x--;
  $(`.${string}`).html(x);
  switch (string) {
    case "timeRemaining":
      timeRemaining = x;
      break;
    case "pairsLeft":
      pairsLeft = x;
      break;
    default: 
      break;
  }
  if (timeRemaining <= 0) {
    clearInterval(gameTime);
    $(".defeat").addClass("show");
    stopFlip();
  }
}

// increment function that will change global variables
function increment(x, string) {
  x++;
  $(`.${string}`).html(x);
  switch (string) {
    case "clicks":
      clicks = x;
      break;
    case "pairsMatched":
      pairsMatched = x;
      break;
    default:
      break;
  }
}

// https://stackoverflow.com/questions/57841575/running-for-loop-and-pause-for-api-call
function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function getPokemon(number) {
  const gameGrid = document.getElementById('game_grid');
  const pokemonTemplate = document.getElementById('pokemon_card');
  let pokemonList = [];
  let randomList = [];
  let random = 0;
  for (let i = 0; i < number; i++) {
    // so they don't think I'm a bot
    await sleep(300);
    let repeat = false;
    // check for no repeats
    do {
      random = Math.floor(Math.random() * 648) + 1;
      for (let i = 0; i < randomList.length; i++) {
        if(random == randomList[i]) {
          repeat = true;
        }
      }
    } while (repeat == true)
    randomList.push(random);
    // pokemon api call
    let response = await fetch(`https://pokeapi.co/api/v2/pokemon?offset=${random}&limit=1`);
    let jsonObj = await response.json();
    let response2 = await fetch(`https://pokeapi.co/api/v2/pokemon/${jsonObj.results[0].name}`);
    let jsonObj2 = await response2.json();
    let pokemon = { url: jsonObj2.sprites.other['official-artwork'].front_shiny };
    pokemonList.push(pokemon);
    pokemonList.push(pokemon);
  }
  // https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
  // array shuffle
  for (let i = pokemonList.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [pokemonList[i], pokemonList[j]] = [pokemonList[j], pokemonList[i]];
  }
  // create game grid
  for (let i = 0; i < pokemonList.length; i++) {
    let pokemonTemp = pokemonTemplate.content.cloneNode(true);
    let pokemonFront = pokemonTemp.querySelector(".front_face")
    pokemonFront.src = pokemonList[i].url;
    pokemonFront.id = `img${i}`;
    gameGrid.appendChild(pokemonTemp);
  }
}

function themeChange(theme) {
  if (theme == "dark") {
    if (!$(".theme-btn.dark").hasClass("selected")) {
      $(".theme-btn.light").removeClass("selected");
      $(".theme-btn.dark").addClass("selected");
      $(".game-container").addClass("theme-dark");
    }
  } else if (theme == "light") {
    if (!$(".theme-btn.light").hasClass("selected")) {
      $(".theme-btn.dark").removeClass("selected");
      $(".theme-btn.light").addClass("selected");
      $(".game-container").removeClass("theme-dark");
    }
  }

  
}

$(document).ready(function() {
  $("#reset").on("click", reset);
  $("#easy").on("click", function () {
    changeMode("easy");
  });
  $("#normal").on("click", function () {
    changeMode("normal");
  });
  $("#hard").on("click", function () {
    changeMode("hard");
  });
  $("#start").on("click", function() {
    setup(mode);
  });
  $("#powerup").on("click", function () {
    powerup();
  });
  $(".theme-btn.dark").on("click", function () {
    themeChange("dark");
  });
  $(".theme-btn.light").on("click", function () {
    themeChange("light");
  });
  displayHeader();
})