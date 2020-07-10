$(document).ready(function () {
  var articleContainer = $('.article-container');
  $(document).on('click', '.btn.save', handleArticleSave);
  $(document).on('click', '.scrape-new', handleArticleScrape);
  $('.clear').on('click', handleArticleClear);
  $('.delete').on('click', handleSaveDelete);
  $('.add').on('click', handleAddNote);

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
    if (article.summary) {
      var cardHeader = $("<div class='card-header'>").append(
        $('<h3>').append(
          $(
            "<a class='article-link' target='_blank' rel='noopener noreferrer'>"
          )
            .attr('href', article.link)
            .text(article.title),
          $("<a class='btn btn-success save'>Save Article</a>"),
          $("<div class='card-body'>").text(article.summary)
        )
      );
    } else {
      var cardHeader = $("<div class='card-header'>").append(
        $('<h3>').append(
          $(
            "<a class='article-link' target='_blank' rel='noopener noreferrer'>"
          )
            .attr('href', article.link)
            .text(article.title),
          $("<a class='btn btn-success save'>Save Article</a>")
        )
      );
    }
    card.append(cardHeader);
    card.data('_id', article._id);
    return card;
  }

  function renderEmpty() {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
        "<h4>Uh Oh. Looks like we don't have any new articles.</h4>",
        '</div>'
      ].join('')
    );
    articleContainer.append(emptyAlert);
  }

  function handleArticleSave() {
    var articleToSave = $(this).parents('.card').data();
    // Remove card from page
    $(this).parents('.card').remove();

    articleToSave.saved = true;
    $.ajax({
      method: 'PUT',
      url: '/api/headlines/' + articleToSave._id,
      data: articleToSave
    }).then(function (data) {
      if (data.saved) {
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
    }).then(function () {});
  }

  function handleAddNote() {
    const message = $('#addNoteInput').val();
    const id = $(this).attr('id');
    const payload = {
      id: id,
      title: 'test',
      body: message
    };
    console.log(payload);

    $.ajax({
      method: 'POST',
      url: '/api/notes',
      data: payload
    }).then(function () {
      console.log('note created');
    });
  }
});
