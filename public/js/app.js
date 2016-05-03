$(document).ready( function() {
  App.init();
});

var App = {
  apiURL: {
    endpoint: "https://en.wikipedia.org/w/api.php",
    query: "",
    parameters: {
      sentences: 15,
      limit: 10
    },
  },
  // The column values below are used to change change the Bootstrap grid layout
  gridParams: {
    colXsImg: 3,
    colXsText: 9,
    colSmImg: 2,
    colSmText: 10,
    colSmOffset: 2,
    colMdImg: 2,
    colMdText: 10
  },
  init: function() {
    $("#searchBox").keyup(function(event) {
      if(event.keyCode == 13) {
        App._submitQuery();
      }
    })
  },
  _submitQuery: function() {
    var query = $("#searchBox").val();
    $(".results").text("");
    App._searchWiki(query);
  },

  _searchWiki(query) {
    $.ajax({
      url: App.apiURL.endpoint
        + "?action=query&format=json&prop=extracts%7Cpageimages&generator=search"
        + "&piprop=thumbnail&pithumbsize=200&pilimit=max&callback=?"
        + "&exsentences=" + App.apiURL.parameters.sentences
        + "&exlimit=" + App.apiURL.parameters.limit
        + "&exintro=" + App.apiURL.parameters.limit
        + "&gsrlimit=" + App.apiURL.parameters.limit
        + "&indexpageids&gsrsearch=" + query,
      dataType: 'json',
      type: 'GET',
      headers: { 'Api-User-Agent': 'Example/1.0' },
      success: function(data, textStatus, jqXHR) {
        App._updateSearchBox();
        App._clearRandomSearch();
        // App._clearRandomSearch();

        var results = '<div class="row"><div class="col-sm-10 col-sm-offset-2"><u>Results for "' + query + '</u>":</div></div><br>';
        $(".resultsHeader").html(results);

        // Error handling for the search results.
        if(!data.error && data.query) {
          var pages = data.query.pages;
          // Page relevance seems to correspond with the index property.  The
          // pages object is made of several individual page objects, each of
          // which have their own index property.  Therefore, an array
          // "pageSortedByIndex" is created made of [pageId:index values] array
          // elements, which are then sorted based on the index values.  The
          // now sorted pageIds are then fed into the "App._showResults"
          // function to display the results by relevance.
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
          var htmlText = '<div class="row"><div class="result col-sm-' + App.gridParams.colSmText + ' col-sm-offset-' + App.gridParams.colSmOffset + '">';
          htmlText += "Sorry, your search turned up no results.</div></div>"
          $(".results").append(htmlText);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.log("AJAX request error: " + JSON.stringify(jqXHR, null, 2));
        // alert("AJAX request error: " + jqXHR.statusText);
          var htmlText = '<font color="red">AJAX request Error</font>';
          $(".error").append(htmlText);
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
      // refer you to other pages ("may refer to").
      if(extract.length < title.length + 30)
        continue;

      // HTML setup for the thumbnail images
      var text = '<div class="row"><div class="imgResults col-md-' + this.gridParams.colMdImg + ' col-sm-' + this.gridParams.colSmImg + ' col-xs-' + this.gridParams.colXsImg + '">';
      // Below checks for whether a thumbnail image is available
      if(pages[pageId].thumbnail != undefined) {
        var imgSrc = "";
        imgSrc = pages[pageId].thumbnail.source;
        text += '<img class="img-responsive" src="' + imgSrc + '"/>'
      }
      text += '</div>'; // Div for grid

      // HTML setup for the "text" part of the search results
      text += '<div class="result col-md-' + this.gridParams.colMdText + ' col-sm-' + this.gridParams.colSmText + ' col-xs-' + this.gridParams.colXsText + '">';
      text += '<div class="resultTitle"><b><a class="resultLink" target="_blank" href="' + link + '">' + title + '</b></a></div>';
      text += extract;
      text += '</div></div><br><br>'; // Div for grid & row

      $(".results").append(text);
    }

  },
  _updateSearchBox: function() {
    $("#searchBox").val("");
    document.getElementById("searchBox").placeholder = "";
    $(".box").css({"margin":"2% 0", "float":"right"});
  },
  _clearRandomSearch: function() {
    $(".container-2").html("");
  }
}
