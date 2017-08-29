var bible = {};
bible.version = '1.3';
bible.index = {};
bible.index['math'] = [25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36, 39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20];
bible.index['mark'] = [45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37, 72, 47, 20];
bible.index['luke'] = [80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35, 32, 31, 37, 43, 48, 47, 38, 71, 56, 53];
bible.index['john'] = [51, 25, 36, 54, 47, 71, 53, 59, 41, 41, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25];
bible.index['acts'] = [26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28, 40, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 30];
bible.index['roma'] = [32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14, 23, 33, 25];
bible.index['1cor'] = [31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 39, 58, 24];
bible.index['2cor'] = [24, 17, 18, 18, 21, 17, 16, 24, 15, 17, 33, 21, 14];
bible.index['gala'] = [24, 21, 29, 31, 26, 18];
bible.index['ephe'] = [23, 22, 21, 32, 32, 24];
bible.index['phil'] = [30, 30, 21, 23];
bible.index['colo'] = [29, 23, 25, 12];
bible.index['1the'] = [9, 20, 13, 18, 28];
bible.index['2the'] = [12, 17, 18];
bible.index['1tim'] = [20, 15, 16, 16, 25, 21];
bible.index['2tim'] = [18, 26, 17, 22];
bible.index['titu'] = [16, 15, 15];
bible.index['phel'] = [25];
bible.index['hebr'] = [14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 21];
bible.index['jame'] = [27, 26, 18, 17, 20];
bible.index['1pet'] = [25, 25, 22, 19, 14];
bible.index['2pet'] = [21, 22, 18];
bible.index['1joh'] = [10, 29, 24, 21, 21];
bible.index['2joh'] = [13];
bible.index['3joh'] = [14];
bible.index['jude'] = [25];
bible.index['reve'] = [20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20, 8, 21, 18, 24, 21, 15, 27, 21];
bible.current = {};
bible.current.author = Object.keys(bible.index)[0];
bible.current.chapter = 0;
bible.current.verse = 0;
bible.current.verses = [];
bible.current.direction = 1;
bible.getIndexNumber = function() {
	return Object.keys(this.index).indexOf(this.current.author);
};
bible.getAuthor = function(index) {
	return Object.keys(this.index)[index];
};

var longTapTimer;
var isAutoPlay;
var autoPlayTimer;
var hideControlTimer;
var isReset;
var db;
var storage;

function init() {
	storage = new Storage();
	storage.init('version', 'bible', function() {
		storage.getData('bible', onInitComplete, console.log, onInitComplete);
	}, console.log, console.log);
	if ('serviceWorker' in navigator) {
		navigator.serviceWorker.register('serviceworker.js')
		.then(function() { console.log("Service Worker Registered"); });
	}
	$('.backward').click(prevVerse);
	$('.forward').click(nextVerse);
	$('#google_translate_element').click(function(e) {
		e.preventDefault();
		e.stopPropagation();
	});
	$('body').contextmenu(showControls);
	$('.speaker').click(function() {
		speak($('.word').text());
	});
	$('.translate').click(resetTranslator);
	$('.autoplay').click(autoPlay);
	$('.controls').mouseup(function() {
		$('.controls').addClass('hide').removeClass('show');
		$('.title').addClass('hide').removeClass('show');
		$('#google_translate_element').addClass('show').removeClass('hide');
		clearTimeout(hideControlTimer);
	});
	$(window).bind('beforeunload', function(e) {
		if(isReset) {
			storage.deleteData(version);
		} else {
			bible.getIndexNumber = null;
			bible.getAuthor = null;
			storage.setData(bible);
		}
		e = null;
	});
	$('.reset').click(function() {
		isReset = true;
		location.reload();
	});
	$('.previous').click(function() {
		if(bible.getIndexNumber() > 0) {
			bible.current.chapter = 0;
			bible.current.verse = 0;
			prevVerse(event, false, true);
		}
	});
	$('.next').click(function() {
		if(bible.getIndexNumber() < Object.keys(bible.index).length - 1) {
			bible.current.chapter = bible.index[bible.current.author].length - 1;
			bible.current.verse = bible.index[bible.current.author][bible.current.chapter];
			nextVerse();
		}
	});
	$('.book').click(function() {
	});
	$('.pin').click(function() {
	});
}

function onInitComplete(data) {
	if(data != null && data.length > 0) {
		Object.assign(data[0], JSON.parse(localStorage.bible));
		cacheVerseCallback();
	} else {
		new Audio('media/instructions.mp3').play();
	}
	if(bible.current.verses.length == 0) {
		cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	}
}

function showControls() {
	$('.controls').addClass('show').removeClass('hide');
	$('.title').addClass('show').removeClass('hide');
	$('#google_translate_element').addClass('hide').removeClass('show');
	hideControlTimer = setTimeout(function() {
		$('.controls').addClass('hide').removeClass('show');
		$('.title').addClass('hide').removeClass('show');
		$('#google_translate_element').addClass('show').removeClass('hide');
	}, 5000);
	return false;
}

function prevVerse(event, isSpeak, isFromStart) {
	if(bible.current.verse - 1 < 0)
	{
		if(bible.current.chapter > 0) {
			bible.current.chapter--;
			bible.current.verse = bible.index[bible.current.author][bible.current.chapter] - 1;
		} else if(bible.getIndexNumber() > 0) {
			bible.current.author = bible.getAuthor(bible.getIndexNumber() - 1);
			bible.current.chapter = bible.index[bible.current.author].length - 1;
			bible.current.verse = bible.index[bible.current.author][bible.current.chapter] - 1;
		} else {
			return;
		}
		$('.cssload-container').removeClass('hide-content');
		$('.content').addClass('hide').removeClass('show');
		clearText();
		if(isFromStart) {
			bible.current.chapter = 0;
			bible.current.verse = 0;
		}
		cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	} else if(bible.current.verse > 0 && bible.current.verses.length > 0) {
		setVerse(bible.current.verses[--bible.current.verse], isSpeak);
	}
}

function nextVerse(event, isSpeak) {
	if(bible.current.verse + 1 > bible.index[bible.current.author][bible.current.chapter] - 1)
	{
		if(bible.index[bible.current.author].length > bible.current.chapter + 1) {
			bible.current.chapter++;
			bible.current.verse = 0;
		} else if(bible.getIndexNumber() < Object.keys(bible.index).length - 1) {
			bible.current.author = bible.getAuthor(bible.getIndexNumber() + 1);
			bible.current.chapter = 0;
			bible.current.verse = 0;
		} else {
			return;
		}
		$('.cssload-container').removeClass('hide-content');
		$('.content').addClass('hide').removeClass('show');
		clearText();
		cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	} else if(bible.current.verse < bible.index[bible.current.author][bible.current.chapter] - 1
		&& bible.current.verses.length > 0) {
		setVerse(bible.current.verses[++bible.current.verse], isSpeak);
	}
}

function clearText() {
	$('#word').text('');
	$('#author').text('');
	$('#chapter').text('');
	$('#verse').text('');
}

function autoPlay(event, flag) {
	if(!isAutoPlay || flag) {
		isAutoPlay = true;
		nextVerse(event, true);
		setTimeout(function() {
			var delay = 125 * $('#word').text().length;
			autoPlayTimer = setTimeout(function() {
				autoPlay(event, true);
			}, delay);
		}, 500);
	} else {
		clearInterval(autoPlayTimer);
	}
	isAutoPlay = !!flag || !isAutoPlay;
}

function setVerse(verse, isSpeak) {
	$('.quote').addClass('hide').removeClass('show');
	setTimeout(function() {
		$('.quote').addClass('show').removeClass('hide');
		$('#word').text(verse.text);
		$('#author').text(verse.book_name);
		$('#chapter').text(verse.chapter);
		$('#verse').text(verse.verse);
		if(isSpeak) {
			speak($('.word').text());
		}
	}, 500);
}

function cacheVerse(author, chapter, start, end) {
	var url = 'https://bible-api.com/' + author + chapter + ':' + start + '-' + end;
	$.ajax({
		url: url, 
		type: 'GET',
		jsonp:'callback',
		dataType: 'jsonp',
		timeout: 30000,
		success: cacheVerseCallback,
		error: errorCallback
	});
}

function cacheVerseCallback(response) {
	if(response && response.verses && response.verses.length > 0) {
		bible.current.verses = response.verses
	}
	if($('#word').text() == '') {
		setVerse(bible.current.verses[bible.current.verse]);
		$('.cssload-container').addClass('hide-content');
		$('.title').addClass('hide');
		$('.content').addClass('show').removeClass('hide');
	}
}

function resetTranslator() {
	translator.setEnabled(false);
	translator.setEnabled(true);
}

function errorCallback() {
	$('.cssload-container').addClass('hide-content');
	$('.messages').removeClass('hide-content').mousedown(function() {
		location.reload();
	});
	new Audio('media/network.error.mp3').play();
}

function speak(word) {
	responsiveVoice.speak(word, 'Hindi Female', {rate: 0.8});
}

$(document).ready(init);