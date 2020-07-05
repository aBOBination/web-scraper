$(document).ready(function () {
  var articleContainer = $('.article-container');
  $(document).on('click', '.btn.save', handleArticleSave);
  $(document).on('click', '.scrape-new', handleArticleScrape);
  $('.clear').on('click', handleArticleClear);
  $('.delete').on('click', handleSaveDelete);

  function initPage() {
    $.ajax({
      method: 'GET',
      url: '/api/headlines'
    }).then(function (data) {
      articleContainer.empty();
      if (data && data.length) {
        renderArticles(data);
      } else {
        renderEmpty();
      }
    });
  }

  function renderArticles(articles) {
    var articleCards = [];
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
    }
    articleContainer.append(articleCards);
  }

  function createCard(article) {
    var card = $("<div class='card'>").attr('data-_id', article._id);
    var cardHeader = $("<div class='card-header'>").append(
      $('<h3>').append(
        $("<a class='article-link' target='_blank' rel='noopener noreferrer'>")
          .attr('href', article.link)
          .text(article.title),
        $("<a class='btn btn-success save'>Save Article</a>")
      )
    );
    var cardBody = $("<div class='card-body'>").text(article.title);
    card.append(cardHeader, cardBody);
    card.data('_id', article._id);
    return card;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        '</div>',
        "<div class='card'>",
        "<div class='card-header text-center'>",
        '<h3>What Would You Like To Do?</h3>',
        '</div>',
        "<div class='card-body text-center'>",
        "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
        "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
        '</div>',
        '</div>'
      ].join('')
    );
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    // TODO
    // This function is triggered when the user wants to save an article
    // When we rendered the article initially, we attached a javascript object containing the headline id
    // to the element using the .data method. Here we retrieve that.
    var articleToSave = $(this).parents('.card').data();
    // Remove card from page
    $(this).parents('.card').remove();

    articleToSave.saved = true;
    // Using a patch method to be semantic since this is an update to an existing record in our collection
    $.ajax({
      method: 'PUT',
      url: '/api/headlines/' + articleToSave._id,
      data: articleToSave
    }).then(function (data) {
      // If the data was saved successfully
      if (data.saved) {
        // Run the initPage function again. This will reload the entire list of articles
        initPage();
      }
    });
  }

  function handleArticleScrape() {
    $.get('/api/fetch').then(function (data) {
      initPage();
    });
  }

  function handleArticleClear() {
    $.ajax({
      method: 'DELETE',
      url: '/api/clear'
    }).then(function () {
      articleContainer.empty();
      initPage();
    });
  }

  function handleSaveDelete() {
    var articleToDelete = $(this).parents('.card').data();
    // Remove card from page
    $(this).parents('.card').remove();
    $.ajax({
      method: 'DELETE',
      url: '/api/clear/' + articleToDelete._id
    }).then(function () {
      // articleContainer.empty();
      // initPage();
    });
  }
});
