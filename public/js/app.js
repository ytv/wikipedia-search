$(document).ready( function() {
  App.init();
});

var App = {
  api: {
    endpoint: 'https://en.wikipedia.org/w/api.php',
    query: '',
    parameters: {
      sentences: 15,
      limit: 10
    },
  },
  // The column values below are used to change change the Bootstrap grid layout
  css: {
      img: {
          xs: 'col-xs-0',
          sm: 'col-sm-2',
          md: 'col-md-2'
      },
      text: {
          xs: 'col-xs-12',
          sm: 'col-sm-10',
          md: 'col-md-10'
      },
      offset: {
          sm: 'col-sm-offset-2'
      }
  },

  results: '.results',

  triggerSubmit: null,

  init: function() {
    $('#searchBox').on('focus', function() {
      App._updateSearchBox();
      App._clearRandomSearch();

      $('#searchBox').on('keydown', function() {
          clearTimeout(App.triggerSubmit);
          if($('#searchBox').val().length >= 2)
            App._triggerSubmit();
      });
    });

    // triggers "Enter" key
    $('#searchBox').keyup(function(event) {
      if(event.keyCode == 13) {
        App._submitQuery();
      }
    })
  },

  _triggerSubmit: function() {
      App.triggerSubmit = setTimeout(function() {
        App._submitQuery();
    }, 300);
  },

  _submitQuery: function() {
    clearTimeout(App.triggerSubmit);
    var query = $('#searchBox').val();
    $(App.results).text('');
    App._searchWiki(query);
  },

  _searchWiki(query) {
    $.ajax({
      url: App.api.endpoint +
        '?action=query&format=json&prop=extracts%7Cpageimages&generator=search&piprop=thumbnail&pithumbsize=200&pilimit=max&callback=?' +
        '&exsentences=' + App.api.parameters.sentences +
        '&exlimit=' + App.api.parameters.limit +
        '&exintro=' + App.api.parameters.limit +
        '&gsrlimit=' + App.api.parameters.limit +
        '&indexpageids&gsrsearch=' +
        query,
      dataType: 'json',
      type: 'GET',
      headers: { 'Api-User-Agent': 'Example/1.0' },
      success: function(data, textStatus, jqXHR) {
        // App._updateSearchBox();
        // App._clearRandomSearch();

        var results = '<div class="row row-header"><div class="' + App.css.text.sm + ' ' + App.css.offset.sm + '"><u>Results for "' + query + '</u>":</div></div><br>';
        $(".resultsHeader").html(results);
        // Error handling for the search results.
        if(!data.error && data.query) {
          var pages = data.query.pages;
        /* Page relevance seems to correspond with the index property.  The
           pages object is made of several individual page objects, each of
           which have their own index property.  Therefore, an array
           'pageSortedByIndex' is created made of [pageId:index values] array
           elements, which are then sorted based on the index values.  The
           now sorted pageIds are then fed into the 'App._showResults'
           function to display the results by relevance. */
          var pageSortedByIndex = [];
          for (var pageId in pages) {
            pageSortedByIndex.push([pageId, pages[pageId].index]);
          }
          pageSortedByIndex.sort(function(a,b) {
            return a[1] - b[1];
          });
          App._showResults(pageSortedByIndex, pages, query);
        }
        else {
          var htmlText = '<div class="row">';
          htmlText += '<div class="result ' + App.css.text.sm +' ' + App.css.offset.sm + '">';
          htmlText += 'Sorry, your search turned up no results.';
          htmlText += '</div>';
          htmlText += '</div>';
          $(App.results).append(htmlText);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("AJAX request error: " + JSON.stringify(jqXHR, null, 2));
        // alert("AJAX request error: " + jqXHR.statusText);
          var htmlText = '<font color="red">AJAX request Error</font>';
          $('.error').append(htmlText);
      }
    })
  },
  _showResults: function(pageIds, pages, query) {

    for (var i in pageIds) {
      var pageId = pageIds[i][0];
      var title = pages[pageId].title;
      var link = 'https://en.wikipedia.org/wiki/' + title;
      var extract = pages[pageId].extract;

      // Below filters out irrelevant results, such as the ones that only
      // refer you to other pages ('may refer to').
      if(extract.length < title.length + 30)
        continue;

      // HTML setup for the thumbnail images
      var text = '<div class="row">';
      text += '<div class="imgResults ' + App.css.img.md + ' ' + App.css.img.sm + ' ' + App.css.img.xs + '">';
      // Below checks for whether a thumbnail image is available
      if(pages[pageId].thumbnail != undefined) {
        var imgSrc = "";
        imgSrc = pages[pageId].thumbnail.source;
        text += '<img class="img-responsive" src="' + imgSrc + '"/>'
      }
      text += '</div>';     // div for grid

      // HTML setup for the 'text' part of the search results
      text += '<div class="result ' + App.css.text.md + ' ' + App.css.text.sm + ' ' + App.css.text.xs + '">';
      text += '<div class="resultTitle">';
      text += '<a class="resultLink" target="_blank" href="' + link + '"><b>' + title + '</b></a>';
      text += '</div>';     // div for title
      text += extract;
      text += '</div>';     //div for grid
      text += '</div>';     //div for row
      $(App.results).append(text);
    }

  },
  _updateSearchBox: function() {
    document.getElementById('searchBox').placeholder = '';
    $('.box').addClass('moveToTopRight');
  },
  _clearRandomSearch: function() {
    $('.container-2').html('');
  }
}
