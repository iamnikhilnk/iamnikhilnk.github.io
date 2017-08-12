var bible = {};
bible.index = {};
bible.index.john = [51, 25, 36, 54, 47, 71, 53, 59, 41, 41, 57, 50, 38, 31, 27, 33, 26, 40, 42, 31, 25];
bible.current = {};
bible.current.author = 'john';
bible.current.chapter = 0;
bible.current.verse = 0;
bible.current.verses = [];
bible.current.direction = 1;

var longTapTimer;
var isLongTap;
var isAutoPlay;
var autoPlayTimer;
var hideControlTimer;

function init() {
	new Audio('media/instructions.mp3').play();
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
	cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	$('.overlay').mouseup(function(e){
		clearTimeout(longTapTimer);
	}).mousedown(function(){
		longTapTimer = setTimeout(function() {
			isLongTap = true;
			$('.controls').addClass('show').removeClass('hide');
			$('.title').addClass('show').removeClass('hide');
			$('#google_translate_element').addClass('hide').removeClass('show');
			hideControlTimer = setTimeout(function() {
				$('.controls').addClass('hide').removeClass('show');
				$('.title').addClass('hide').removeClass('show');
				$('#google_translate_element').addClass('show').removeClass('hide');
			}, 5000);
		},500);
	});
	$('.speaker').click(function() {
		speak($('.word').text());
	});
	$('.translate').click(resetTranslator);
	$('.autoplay').click(autoPlay);
	$('.controls').mouseup(function() {
		$('.controls').addClass('hide').removeClass('show');
		$('.title').addClass('hide').removeClass('show');
		clearTimeout(hideControlTimer);
	});
}

function prevVerse() {
	if(!isLongTap && bible.current.verse > 0 && bible.current.verses.length > 0) {
		setVerse(bible.current.verses[bible.current.verse - 1]);
	}
	if(--bible.current.verse <= 0)
	{
		if(bible.current.chapter > 0) {
			bible.current.chapter--;
		} else {
			// change author
			bible.current.chapter = 0;
			return;
		}
		bible.current.verse = bible.index[bible.current.author][bible.current.chapter] - 1;
		$('.cssload-container').removeClass('hide-content');
		$('.content').addClass('hide').removeClass('show');
		clearText();
		cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	}
	isLongTap = false;
}

function nextVerse() {
	if(!isLongTap && bible.current.verse < bible.index[bible.current.author][bible.current.chapter] - 1
		&& bible.current.verses.length > 0) {
		setVerse(bible.current.verses[bible.current.verse + 1]);
	}
	if(++bible.current.verse > bible.index[bible.current.author][bible.current.chapter] - 1)
	{
		if(bible.index[bible.current.author].length > bible.current.chapter) {
			bible.current.chapter++;
		} else {
			// change author
			bible.current.chapter = 0;
			return;
		}
		bible.current.verse = 0;
		$('.cssload-container').removeClass('hide-content');
		$('.content').addClass('hide').removeClass('show');
		clearText();
		cacheVerse(bible.current.author, bible.current.chapter + 1, 1, bible.index[bible.current.author][bible.current.chapter]);
	}
	isLongTap = false;
}

function clearText() {
	$('#word').text('');
	$('#author').text('');
	$('#chapter').text('');
	$('#verse').text('');
}

function autoPlay() {
	if(!isAutoPlay) {
		nextVerse();
		autoPlayTimer = setInterval(function() {
			nextVerse();
		}, 15000);
	} else {
		clearInterval(autoPlayTimer);
	}
	isAutoPlay = !isAutoPlay;
}

function setVerse(verse) {
	$('.quote').addClass('hide').removeClass('show');
	setTimeout(function() {
		$('.quote').addClass('show').removeClass('hide');
		$('#word').text(verse.text);
		$('#author').text(verse.book_name);
		$('#chapter').text(verse.chapter);
		$('#verse').text(verse.verse);
		if(isAutoPlay) {
			speak($('.word').text().trim());
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
	if(response.verses && response.verses.length > 0) {
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