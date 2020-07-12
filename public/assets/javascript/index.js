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
    var articleNoteModal = [];
    for (var i = 0; i < articles.length; i++) {
      articleCards.push(createCard(articles[i]));
      articleCards.push(createNoteModal(articles[i]));
    }
    articleContainer.append(articleCards);
    articleContainer.append(articleNoteModal);
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
          $('<a class="btn notes" data-toggle="modal">Notes</a>').attr(
            'data-target',
            '#' + article._id
          ),
          $("<a class='btn save'>Save Article</a>"),
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
          $('<a class="btn notes" data-toggle="modal">Notes</a>').attr(
            'data-target',
            '#' + article._id
          ),
          $("<a class='btn save'>Save Article</a>")
        )
      );
    }
    card.append(cardHeader);
    card.data('_id', article._id);
    return card;
  }

  function createNote(articleNote) {
    const noteDiv = $('<div>');
    articleNote.forEach((note) => {
      const noteWrapper = $('<div>').append(
        $(`<p>${note[0].title}</p>`),
        $(`<p>${note[0].body}</p>`)
      );
      noteDiv.append(noteWrapper);
      const title = note[0].title;
      const body = note[0].body;
    });
    console.log(noteDiv[0].innerHTML);
    return noteDiv[0].innerHTML;
  }

  function createNoteModal(article) {
    const notes = createNote(article.note);
    const modal = $(
      [
        `<div class="modal fade" id=${article._id} tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">`,
        '<div class="modal-dialog modal-dialog-centered" role="document">',
        '<div class="modal-content">',
        '<div class="modal-header">',
        '<h5 class="modal-title" id="exampleModalLongTitle">Notes</h5>',
        '<button type="button" class="close" data-dismiss="modal" aria-label="Close">',
        '<span aria-hidden="true">&times;</span>',
        '</button>',
        '</div>',
        '<div class="modal-body">',
        '<div>',
        `${notes}`,
        '</div>',
        '<form>',
        ' <div class="form-group">',
        '<label for="addNoteInput"></label>',
        '<textarea class="form-control" id="addNoteInput" rows="3" placeholder="Add note here..."></textarea>',
        '</div>',
        '</form>',
        '</div>',
        '<div class="modal-footer">',
        '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>',
        `<button type="button" id=${article._id} class="btn btn-primary add">Add Note</button>`,
        '</div>',
        '</div>',
        '</div>',
        '</div>'
      ].join('')
    );
    modal.data('_id', article._id);
    return modal;
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
