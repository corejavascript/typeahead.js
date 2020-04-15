describe('$plugin', function() {

  beforeEach(function() {
    var $fixture;

    setFixtures('<input class="test-input" type="text" autocomplete="on">');

    $fixture = $('#jasmine-fixtures');
    this.$input = $fixture.find('.test-input');

    this.$input.typeahead(null, {
      displayKey: 'v',
      source: function(q, sync) {
        sync([{ v: '1' }, { v: '2' }, { v: '3' }]);
      }
    });
  });

  it('#enable should enable the typeahead', function() {
    this.$input.typeahead('disable');
    expect(this.$input.typeahead('isEnabled')).toBe(false);

    this.$input.typeahead('enable');
    expect(this.$input.typeahead('isEnabled')).toBe(true);
  });

  it('#disable should disable the typeahead', function() {
    this.$input.typeahead('enable');
    expect(this.$input.typeahead('isEnabled')).toBe(true);

    this.$input.typeahead('disable');
    expect(this.$input.typeahead('isEnabled')).toBe(false);
  });

  it('#activate should activate the typeahead', function() {
    this.$input.typeahead('deactivate');
    expect(this.$input.typeahead('isActive')).toBe(false);

    this.$input.typeahead('activate');
    expect(this.$input.typeahead('isActive')).toBe(true);
  });

  it('#activate should fail to activate the typeahead if disabled', function() {
    this.$input.typeahead('deactivate');
    expect(this.$input.typeahead('isActive')).toBe(false);
    this.$input.typeahead('disable');

    this.$input.typeahead('activate');
    expect(this.$input.typeahead('isActive')).toBe(false);
  });

  it('#deactivate should deactivate the typeahead', function() {
    this.$input.typeahead('activate');
    expect(this.$input.typeahead('isActive')).toBe(true);

    this.$input.typeahead('deactivate');
    expect(this.$input.typeahead('isActive')).toBe(false);
  });

  it('#open should open the menu', function() {
    this.$input.typeahead('close');
    expect(this.$input.typeahead('isOpen')).toBe(false);

    this.$input.typeahead('open');
    expect(this.$input.typeahead('isOpen')).toBe(true);
  });

  it('#close should close the menu', function() {
    this.$input.typeahead('open');
    expect(this.$input.typeahead('isOpen')).toBe(true);

    this.$input.typeahead('close');
    expect(this.$input.typeahead('isOpen')).toBe(false);
  });

  it('#select should select selectable', function() {
    var $el;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    $el = $('.tt-selectable').first();

    expect(this.$input.typeahead('select', $el)).toBe(true);
    expect(this.$input.typeahead('val')).toBe('1');
  });

  it('#select should return false if not valid selectable', function() {
    var body;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    body = document.body;

    expect(this.$input.typeahead('select', body)).toBe(false);
  });

  it('#autocomplete should autocomplete to selectable', function() {
    var $el;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    $el = $('.tt-selectable').first();

    expect(this.$input.typeahead('autocomplete', $el)).toBe(true);
    expect(this.$input.typeahead('val')).toBe('1');
  });

  it('#autocomplete should return false if not valid selectable', function() {
    var body;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    body = document.body;

    expect(this.$input.typeahead('autocomplete', body)).toBe(false);
  });

  it('#moveCursor should move cursor', function() {
    var $el;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    $el = $('.tt-selectable').first();

    expect($el).not.toHaveClass('tt-cursor');
    expect(this.$input.typeahead('moveCursor', 1)).toBe(true);
    expect($el).toHaveClass('tt-cursor');
  });

  it('#select should return false if not valid selectable', function() {
    var body;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    body = document.body;

    expect(this.$input.typeahead('select', body)).toBe(false);
  });

  it('#val() should typeahead value of element', function() {
    var $els;

    this.$input.typeahead('val', 'foo');
    $els = this.$input.add('<div>');

    expect($els.typeahead('val')).toBe('foo');
    expect($els.typeahead('query')).toBe('foo');
  });

  it('#val(q) should set query', function() {
    this.$input.typeahead('val', 'foo');
    expect(this.$input.typeahead('val')).toBe('foo');
    expect(this.$input.typeahead('query')).toBe('foo');
  });

  it('#val(q) should coerce null and undefined to empty string', function() {
    this.$input.typeahead('val', null);
    expect(this.$input.typeahead('val')).toBe('');

    this.$input.typeahead('val', undefined);
    expect(this.$input.typeahead('val')).toBe('');
  });

  it('#val(q) should set query silently', function() {
    var $el;

    // activate and set val to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('val', 'o');
    expect($('.tt-selectable').length).toBe(0)
  });

  it('#query() should typeahead value of element', function() {
    var $els;

    this.$input.typeahead('query', 'foo');
    $els = this.$input.add('<div>');

    expect($els.typeahead('val')).toBe('foo');
    expect($els.typeahead('query')).toBe('foo');
  });

  it('#query(q) should set query', function() {
    this.$input.typeahead('query', 'foo');
    expect(this.$input.typeahead('val')).toBe('foo');
    expect(this.$input.typeahead('query')).toBe('foo');
  });

  it('#query(q) should coerce null and undefined to empty string', function() {
    this.$input.typeahead('query', null);
    expect(this.$input.typeahead('query')).toBe('');

    this.$input.typeahead('query', undefined);
    expect(this.$input.typeahead('query')).toBe('');
  });

  it('#query(q) should set query noisily', function() {
    var $el;

    // activate and set query to render some selectables
    this.$input.typeahead('activate');
    this.$input.typeahead('query', 'o');
    expect($('.tt-selectable').length).toBe(3)
  });

  it('#destroy should revert modified attributes', function() {
    expect(this.$input).toHaveAttr('dir');
    expect(this.$input).toHaveAttr('spellcheck');
    expect(this.$input).toHaveAttr('style');

    this.$input.typeahead('destroy');

    expect(this.$input).not.toHaveAttr('dir');
    expect(this.$input).not.toHaveAttr('spellcheck');
    expect(this.$input).not.toHaveAttr('style');
  });

  it('#destroy should remove data', function() {
    expect(this.$input.data('tt-www')).toBeTruthy();
    expect(this.$input.data('tt-attrs')).toBeTruthy();
    expect(this.$input.data('tt-typeahead')).toBeTruthy();

    this.$input.typeahead('destroy');

    expect(this.$input.data('tt-www')).toBeFalsy();
    expect(this.$input.data('tt-attrs')).toBeFalsy();
    expect(this.$input.data('tt-typeahead')).toBeFalsy();
  });

  it('#destroy should remove add classes', function() {
    expect(this.$input).toHaveClass('tt-input');
    this.$input.typeahead('destroy');
    expect(this.$input).not.toHaveClass('tt-input');
  });

  it('#destroy should revert DOM changes', function() {
    expect($('.twitter-typeahead')).toExist();
    this.$input.typeahead('destroy');
    expect($('.twitter-typeahead')).not.toExist();
  });
});
