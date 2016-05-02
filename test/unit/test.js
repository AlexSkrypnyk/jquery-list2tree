/**
 * @file
 * QUnit tests.
 */

(function () {
  var classes = {
    tree: 'js-tree',
    leaf: 'js-list2tree-leaf',
    leafDepth: 'js-list2tree-leaf-depth',
    leafDepthCss: 'leaf-depth',
    leafCollapsed: 'js-list2tree-leaf-collapsed',
    trigger: 'js-list2tree-trigger',
    triggerCollapsed: 'js-list2tree-trigger-collapsed',
    triggerCollapsedCss: 'trigger-collapsed',
    triggerExpanded: 'js-list2tree-trigger-expanded',
    triggerExpandedCss: 'trigger-collapsed',
  };

  function getLeafById(id) {
    var $leaf = null;
    $('.' + classes.tree).find('.' + classes.leaf).each(function () {
      if ($(this).find('input').attr('id') === id) {
        $leaf = $(this);
        return false;
      }
    });

    if (!$leaf) {
      this.ok($leaf, 'Leaf found');
    }
    return $leaf;
  }

  function getTriggerById(id) {
    var $leaf = getLeafById(id);
    return $leaf.find('.' + classes.trigger);
  }

  function clickTrigger(id) {
    getTriggerById(id).simulate('click');
  }

  QUnit.assert.fieldDepth = function (id, depth) {
    var $leaf = getLeafById(id);

    this.ok($leaf.hasClass(classes.leafDepth + '-' + depth));
    this.ok($leaf.hasClass(classes.leafDepthCss + '-' + depth));
  };

  QUnit.assert.triggerPresent = function (id) {
    var $trigger = getTriggerById(id);
    this.ok($trigger.length === 1, 'Trigger attached to the leaf');
  };

  QUnit.assert.triggerNotPresent = function (id) {
    var $trigger = getTriggerById(id);
    this.ok($trigger.length === 0, 'Trigger is not attached to the leaf');
  };

  QUnit.assert.leafVisible = function (id) {
    this.ok(getLeafById(id).is(':visible'), 'Leaf is visible');
  };

  QUnit.assert.leafNotVisible = function (id) {
    this.notOk(getLeafById(id).is(':visible'), 'Leaf is not visible');
  };

  QUnit.assert.leafCollapsed = function (id) {
    this.ok(getLeafById(id).hasClass(classes.leafCollapsed), 'Leaf collapsed class present');
  };

  QUnit.assert.leafExpanded = function (id) {
    this.notOk(getLeafById(id).hasClass(classes.leafCollapsed), 'Leaf collapsed class absent');
  };

  QUnit.assert.triggerCollapsed = function (id) {
    this.ok(getTriggerById(id).hasClass(classes.triggerCollapsed), 'Trigger collapsed class present');
    this.notOk(getTriggerById(id).hasClass(classes.triggerExpanded), 'Trigger collapsed class absent');
  };

  QUnit.assert.triggerExpanded = function (id) {
    this.ok(getTriggerById(id).hasClass(classes.triggerExpanded), 'Trigger expanded class present');
    this.notOk(getTriggerById(id).hasClass(classes.triggerCollapsed), 'Trigger collapsed class absent');
  };

  QUnit.module('Initial processing');

  test('Depths', function (assert) {
    $('.js-tree').list2tree();

    assert.fieldDepth('leaf-1', 0);
    assert.fieldDepth('leaf-11', 1);
    assert.fieldDepth('leaf-12', 1);
    assert.fieldDepth('leaf-2', 0);
    assert.fieldDepth('leaf-21', 1);
    assert.fieldDepth('leaf-22', 1);
    assert.fieldDepth('leaf-221', 2);
    assert.fieldDepth('leaf-2221', 3);
    assert.fieldDepth('leaf-2222', 3);
    assert.fieldDepth('leaf-2223', 3);
    assert.fieldDepth('leaf-223', 2);
    assert.fieldDepth('leaf-23', 1);
    assert.fieldDepth('leaf-3', 0);
    assert.fieldDepth('leaf-31', 1);
    assert.fieldDepth('leaf-32', 1);
    assert.fieldDepth('leaf-33', 1);
    assert.fieldDepth('leaf-4', 0);
    assert.fieldDepth('leaf-5', 0);
  });

  test('Triggers', function (assert) {
    $('.js-tree').list2tree();

    assert.triggerPresent('leaf-1');
    assert.triggerNotPresent('leaf-11');
    assert.triggerNotPresent('leaf-12');
    assert.triggerPresent('leaf-2');
    assert.triggerNotPresent('leaf-21');
    assert.triggerPresent('leaf-22');
    assert.triggerNotPresent('leaf-221');
    assert.triggerNotPresent('leaf-2221');
    assert.triggerNotPresent('leaf-2222');
    assert.triggerNotPresent('leaf-2223');
    assert.triggerNotPresent('leaf-223');
    assert.triggerNotPresent('leaf-23');
    assert.triggerPresent('leaf-3');
    assert.triggerNotPresent('leaf-31');
    assert.triggerNotPresent('leaf-32');
    assert.triggerNotPresent('leaf-33');
    assert.triggerNotPresent('leaf-4');
    assert.triggerNotPresent('leaf-5');
  });

  QUnit.module('Expanding/collapsing');

  test('Leaf expand', function (assert) {
    $('.js-tree').list2tree();

    var id = 'leaf-1';
    assert.leafExpanded(id);
    assert.triggerExpanded(id);
    clickTrigger(id);
    assert.leafCollapsed(id);
    assert.triggerCollapsed(id);
  });

  test('Leaf collapse', function (assert) {
    $('.js-tree').list2tree({
      state: 'collapsed'
    });

    var id = 'leaf-1';
    assert.leafCollapsed(id);
    assert.triggerCollapsed(id);
    clickTrigger(id);
    assert.leafExpanded(id);
    assert.triggerExpanded(id);
  });

  test('Leaf expand/collapse shows/hides children', function (assert) {
    $('.js-tree').list2tree();

    var parentId = 'leaf-1';
    var childId1 = 'leaf-11';
    var childId2 = 'leaf-12';
    var parentIdSibling = 'leaf-2';

    // Assert initial expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafVisible(childId1);
    assert.leafVisible(childId2);
    assert.leafExpanded(parentIdSibling);
    // Collapse leaf.
    clickTrigger(parentId);
    // Assert collapsed state.
    assert.leafCollapsed(parentId);
    assert.leafNotVisible(childId1);
    assert.leafNotVisible(childId2);
    // Assert that collapsing did not change the state of a sibling parent leaf.
    assert.leafVisible(parentIdSibling);
    // Expand leaf.
    clickTrigger(parentId);
    // Assert new expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafVisible(childId1);
    assert.leafVisible(childId2);
    assert.leafVisible(parentIdSibling);
  });

  test('Child leaf expand/collapse shows/hides grand children', function (assert) {
    $('.js-tree').list2tree();

    var parentId = 'leaf-2';
    var parentIdSibling = 'leaf-3';
    var childId = 'leaf-22';
    var childSiblingId1 = 'leaf-21';
    var childSiblingId2 = 'leaf-23';
    var grandChildId1 = 'leaf-221';
    var grandChildId2 = 'leaf-222';
    var grandChildId3 = 'leaf-223';

    // Assert initial expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafExpanded(childId);
    assert.triggerExpanded(childId);
    assert.leafVisible(grandChildId1);
    assert.leafVisible(grandChildId2);
    assert.leafVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Collapse leaf.
    clickTrigger(childId);
    // Assert collapsed state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafCollapsed(childId);
    assert.triggerCollapsed(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Expand leaf.
    clickTrigger(childId);
    // Assert new expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafExpanded(childId);
    assert.triggerExpanded(childId);
    assert.leafVisible(grandChildId1);
    assert.leafVisible(grandChildId2);
    assert.leafVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
  });

  test('Parent leaf collapses all children and grand children', function (assert) {
    $('.js-tree').list2tree();

    var parentId = 'leaf-2';
    var parentIdSibling = 'leaf-3';
    var childId = 'leaf-22';
    var childSiblingId1 = 'leaf-21';
    var childSiblingId2 = 'leaf-23';
    var grandChildId1 = 'leaf-221';
    var grandChildId2 = 'leaf-222';
    var grandChildId3 = 'leaf-223';

    // Assert initial expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafExpanded(childId);
    assert.triggerExpanded(childId);
    assert.leafVisible(grandChildId1);
    assert.leafVisible(grandChildId2);
    assert.leafVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Collapse leaf.
    clickTrigger(parentId);
    // Assert collapsed state.
    assert.leafCollapsed(parentId);
    assert.triggerCollapsed(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafNotVisible(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafNotVisible(childSiblingId1);
    assert.leafNotVisible(childSiblingId2);
  });

  test('Parent leaf expands previously collapsed all children and grand children', function (assert) {
    $('.js-tree').list2tree();

    var parentId = 'leaf-2';
    var parentIdSibling = 'leaf-3';
    var childId = 'leaf-22';
    var childSiblingId1 = 'leaf-21';
    var childSiblingId2 = 'leaf-23';
    var grandChildId1 = 'leaf-221';
    var grandChildId2 = 'leaf-222';
    var grandChildId3 = 'leaf-223';

    // Assert initial expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafExpanded(childId);
    assert.triggerExpanded(childId);
    assert.leafVisible(grandChildId1);
    assert.leafVisible(grandChildId2);
    assert.leafVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Collapse child leaf.
    clickTrigger(childId);
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafCollapsed(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Collapse parent leaf.
    clickTrigger(parentId);
    // Assert collapsed state.
    assert.leafCollapsed(parentId);
    assert.triggerCollapsed(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafNotVisible(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafNotVisible(childSiblingId1);
    assert.leafNotVisible(childSiblingId2);
    // Expand parent leaf - all previously collapsed fields should stay
    // collapsed.
    clickTrigger(parentId);
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafCollapsed(childId);
    assert.leafVisible(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
  });

  test('Parent leaf collapses and expands previously expanded all children and grand children - should be collapsed', function (assert) {
    $('.js-tree').list2tree();

    var parentId = 'leaf-2';
    var parentIdSibling = 'leaf-3';
    var childId = 'leaf-22';
    var childSiblingId1 = 'leaf-21';
    var childSiblingId2 = 'leaf-23';
    var grandChildId1 = 'leaf-221';
    var grandChildId2 = 'leaf-222';
    var grandChildId3 = 'leaf-223';

    // Assert initial expanded state.
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafExpanded(childId);
    assert.triggerExpanded(childId);
    assert.leafVisible(grandChildId1);
    assert.leafVisible(grandChildId2);
    assert.leafVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
    // Collapse parent leaf.
    clickTrigger(parentId);
    // Assert collapsed state.
    assert.leafCollapsed(parentId);
    assert.triggerCollapsed(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafNotVisible(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafNotVisible(childSiblingId1);
    assert.leafNotVisible(childSiblingId2);
    // Expand parent leaf - all previously non-collapsed fields should stay
    // collapsed (state is not remember).
    clickTrigger(parentId);
    assert.leafExpanded(parentId);
    assert.triggerExpanded(parentId);
    assert.leafExpanded(parentIdSibling);
    assert.leafCollapsed(childId);
    assert.leafVisible(childId);
    assert.leafNotVisible(grandChildId1);
    assert.leafNotVisible(grandChildId2);
    assert.leafNotVisible(grandChildId3);
    assert.leafVisible(childSiblingId1);
    assert.leafVisible(childSiblingId2);
  });
}());
