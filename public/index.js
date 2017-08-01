function onCodeChange (cm) {
  var value = cm.getValue();

  superagent
    .post('/code')
    .send(value)
    .set('Accept', 'application/json')
    .set('Content-Type', 'text/plain')
    .end(function(err, res){
      if (err) {
        document.getElementById('errors').innerHTML = res.body.errors ? JSON.stringify(res.body.errors, null, 2) : res.body.message;
        document.querySelector('.errors-wrapper').classList.remove('errors-wrapper--hidden');
        return;
      }

      var result = res.text;

      document.getElementById('result').innerHTML = result;
      document.querySelector('.errors-wrapper').classList.add('errors-wrapper--hidden');

      bindExpandButtons();

      try {
        localStorage.setItem('doc', value);
        localStorage.setItem('result', result);
      } catch (e) {
        console.error('Could not store result in localStorage.');
      }
    });
}

var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
  mode: "text/yaml",
  lineNumbers: true,
  lineWrapping: true,
  theme: 'material'
});

editor.on('change', _.debounce(onCodeChange, 500));

try {
  var doc = localStorage.getItem('doc');
  var result = localStorage.getItem('result');
  editor.setValue(doc);
} catch (e) {
  console.error('Could not read previous document from localStorage.');

  editor.setValue(document.getElementById("code").value);
}

function bindExpandButtons () {
  var buttons = document.querySelectorAll('.table__expand');

  for(var i=0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function (e) {
      var tableRow = document.querySelector('[data-nested-index="' + e.target.attributes['data-index'].value + '"]');
      tableRow.classList.toggle('table__body__row--with-nested--expanded');
      e.target.classList.toggle('table__expand--open');
    });
  }
}
