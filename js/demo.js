$(function(){
	"use strict";

	/*------------------------- querySelectorAll  -------------------------*/

	(function () {
		var listEl        = document.getElementById('query-selector-all-list'),
				countEl       = document.getElementById('query-selector-all-count'),
				alertEl       = document.getElementById('query-selector-all-alert'),
				addForm       = document.getElementById('query-selector-all-add-form'),
				addInputCount = document.getElementById('query-selector-all-add-input-count'),
				addInputDelay = document.getElementById('query-selector-all-add-input-delay'),
				nodeList      = watched(listEl).querySelectorAll('.watched-item'),
				addItem       = function (delay) {
					setTimeout(function () {
						var link = document.createElement('a');
						link.href = "#";
						link.setAttribute('data-index', '?');
						link.className = "list-group-item watched-item";
						listEl.appendChild(link);
					}, delay);
				},
				addAlert      = function (type, text) {
					var alert = document.createElement('div');
					alert.className = 'alert alert-' + type + ' fade in col-md-6';
					alert.textContent = text;
					alertEl.appendChild(alert);
					setTimeout(function () {
						alertEl.removeChild(alert);
					}, 2500);
				},
				updateList    = function () {
					countEl.textContent = nodeList.length;
					nodeList.forEach(function (el, index) {
						el.setAttribute("data-index", index + 1);
						el.style.color = "#43ac6a";
					});
				};

		listEl.addEventListener('click', function (event) {
			event.preventDefault();
			if (event.target.classList.contains('watched-item')) {
				event.target.parentNode.removeChild(event.target);
			}
		});

		addForm.addEventListener('submit', function (e) {
			e.preventDefault();
			var count        = parseInt(addInputCount.value, 10),
					delay        = parseInt(addInputDelay.value, 10),
					currentDelay = 0;
			if (!isNaN(count) && count > 0 && !isNaN(delay) && delay >= 0) {
				for (var i = 0; i < count; i++) {
					addItem(currentDelay);
					currentDelay += delay;
				}
			}
		});

		nodeList.on('added', function (addedElements) {
			updateList();
			addAlert('success', 'Added ' + addedElements.length + ' new item(s) to the list.')
		});
		nodeList.on('removed', function (addedElements) {
			updateList();
			addAlert('info', 'Removed ' + addedElements.length + ' item(s) from the list.')
		});
		updateList();

	}());

});