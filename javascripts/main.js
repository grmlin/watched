(function () {
	"use strict";

	// ------------------------- querySelectorAll demo -------------------------

	(function () {
		var wrapper = document.getElementById('query-selector-all-wrapper'),
				countEl = document.getElementById('query-selector-all-count'),
				addForm = document.getElementById('query-selector-all-add-form'),
				addInputCount = document.getElementById('query-selector-all-add-input-count'),
				addInputDelay = document.getElementById('query-selector-all-add-input-delay'),
				nodeList = watched(wrapper).querySelectorAll('.watched-item'),
				addItem = function (delay) {
					setTimeout(function () {
						var link = document.createElement('a');
						link.href = "#";
						link.textContent = "lorem ipsum";
						link.className = "list-group-item watched-item";
						wrapper.appendChild(link);
					}, delay);
				},
				updateList = function () {
					countEl.textContent = nodeList.length;
					nodeList.forEach(function (el, index) {
						el.setAttribute("data-index", index + 1);
						el.style.color = "#43ac6a";
					});
				};

		wrapper.addEventListener('click', function (event) {
			event.preventDefault();
			if (event.target.classList.contains('watched-item')) {
				event.target.parentNode.removeChild(event.target);
			}
		});

		addForm.addEventListener('submit', function (e) {
			e.preventDefault();
			var count = parseInt(addInputCount.value, 10),
					delay = parseInt(addInputDelay.value, 10),
					currentDelay = 0;
			if (!isNaN(count) && count > 0 && !isNaN(delay) && delay >= 0) {
				for (var i = 0; i < count; i++) {
					addItem(currentDelay);
					currentDelay += delay;
				}
			}
		});

		nodeList.on('changed', function () {
			updateList();
		});

		updateList();

	}());

}());