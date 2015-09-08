/**
 * @file
 * QUnit tests.
 */

(function () {
  /**
   * Asserts field values allowing all events to fire beforehand.
   */
  QUnit.assert.fieldValues = function (cb, timeout) {
    timeout = timeout || 1;
    stop();
    setTimeout(function () {
      cb();
      start();
    }, timeout);
  };

  /**
   * Helper to get value from an element.
   */
  $.fn.getValue = function () {
    return $(this).is('input, textarea') ? $(this).val() : $(this).html();
  };

  /**
   * Generate random string with n characters of length.
   */
  var randomString = function (n) {
    return new Array(n).join().replace(/(.|$)/g, function () {
      return ((Math.random() * 36) | 0).toString(36);
    });
  };

  test('Test positive', function (assert) {
    var value = randomString(5),
      $src = $('#text1'),
      $dst = $('#text2');

    assert.ok(true, 'Positive test');
  });
}());
