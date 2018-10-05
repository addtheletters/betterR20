function d20plusEngine () {
	d20plus.engine = {};

	d20plus.engine.addProFeatures = () => {
		d20plus.ut.log("Add Pro features");

		d20plus.setMode = d20plus.mod.setMode;
		window.setMode = d20plus.mod.setMode;

		// rebind buttons with new setMode
		const $drawTools = $("#drawingtools");
		const $rect = $drawTools.find(".chooserect");
		const $path = $drawTools.find(".choosepath");
		const $poly = $drawTools.find(".choosepolygon");
		$drawTools.unbind(clicktype).bind(clicktype, () => {
			$(this).hasClass("rect") ? setMode("rect") : $(this).hasClass("text") ? setMode("text") : $(this).hasClass("path") ? setMode("path") : $(this).hasClass("drawselect") ? setMode("drawselect") : $(this).hasClass("polygon") && setMode("polygon")
		});
		$rect.unbind(clicktype).bind(clicktype, () => {
			setMode("rect");
			return false;
		});
		$path.unbind(clicktype).bind(clicktype, () => {
			setMode("path");
			return false;
		});
		$poly.unbind(clicktype).bind(clicktype, () => {
			setMode("polygon");
			return false;
		});
		$("#rect").unbind(clicktype).bind(clicktype, () => setMode("rect"));
		$("#path").unbind(clicktype).bind(clicktype, () => setMode("path"));

		if (!$(`#fxtools`).length) {
			const $fxMode = $(`<li id="fxtools"/>`).append(`<span class="pictos">e</span>`);
			$fxMode.on("click", () => {
				d20plus.setMode("fxtools");
			});
			$(`#drawingtools`).after($fxMode);
		}

		// bind new hotkeys
		Mousetrap.bind("q q", function () { // default ruler on q-q
			setMode("measure");
			$(`#measure_mode`).val("1").trigger("change");
			return false;
		});

		Mousetrap.bind("q r", function () { // radius
			setMode("measure");
			$(`#measure_mode`).val("2").trigger("change");
			return false;
		});

		Mousetrap.bind("q c", function () { // cone
			setMode("measure");
			$(`#measure_mode`).val("3").trigger("change");
			return false;
		});

		Mousetrap.bind("q e", function () { // box
			setMode("measure");
			$(`#measure_mode`).val("4").trigger("change");
			return false;
		});

		Mousetrap.bind("q w", function () { // line
			setMode("measure");
			$(`#measure_mode`).val("5").trigger("change");
			return false;
		});

		if (window.is_gm) {
			// add lighting layer tool
			if (!$(`#editinglayer .choosewalls`).length) {
				$(`#editinglayer .choosegmlayer`).after(`<li class="choosewalls"><span class="pictostwo">r</span> Dynamic Lighting</li>`);
			}

			// ensure tokens have editable sight
			$("#tmpl_tokeneditor").replaceWith(d20plus.template_TokenEditor);
			// show dynamic lighting/etc page settings
			$("#tmpl_pagesettings").replaceWith(d20plus.template_pageSettings);
			$("#page-toolbar").on("mousedown", ".settings", function () {
				var e = d20.Campaign.pages.get($(this).parents(".availablepage").attr("data-pageid"));
				e.view._template = $.jqotec("#tmpl_pagesettings");
			});
		}
	};

	d20plus.engine.enhanceMeasureTool = () => {
		d20plus.ut.log("Enhance Measure tool");

		// add extra toolbar
		const $wrpBar = $(`#secondary-toolbar`);
		const toAdd = `
				<ul class="mode measure" style="display: none;">
					<li>
						<select id="measure_mode" style="width: 100px;">
							<option value="1" selected>Ruler</option>
							<option value="2">Radius</option>
							<option value="3">Cone</option>
							<option value="4">Box</option>
							<option value="5">Line</option>
						</select>
					</li>
					<li class="measure_mode_sub measure_mode_sub_2" style="display: none;">
						<select id="measure_mode_sel_2" style="width: 100px;">
							<option value="1" selected>Burst</option>
							<option value="2">Blast</option>
						</select>
					</li>
					<li class="measure_mode_sub measure_mode_sub_3" style="display: none;">
						<input type="number" min="0" id="measure_mode_ipt_3" style="width: 45px;" value="1">
						<label style="display: inline-flex;" title="The PHB cone rules are the textbook definition of one radian.">rad.</label>
						<select id="measure_mode_sel_3" style="width: 120px;">
							<option value="1" selected>Edge: Flat</option>
							<option value="2">Edge: Rounded</option>
						</select>
					</li>
					<li class="measure_mode_sub measure_mode_sub_4" style="display: none;">
						<select id="measure_mode_sel_4" style="width: 100px;">
							<option value="1" selected>Burst</option>
							<option value="2">Blast</option>
						</select>
					</li>
					<li class="measure_mode_sub measure_mode_sub_5" style="display: none;">
						<select id="measure_mode_sel_5" style="width: 120px;">
							<option value="1" selected>Total Width: </option>
							<option value="2">Width To Edge: </option>
						</select>
						<input type="number" min="0" id="measure_mode_ipt_5" style="width: 40px;" value="5">
						<label style="display: inline-flex;">units</label>
					</li>
				</ul>`;
		$wrpBar.append(toAdd);

		$(`#measure`).click(() => {
			d20plus.setMode("measure");
		});
		const $selMeasure = $(`#measure_mode`);
		$selMeasure.on("change", () => {
			$(`.measure_mode_sub`).hide();
			$(`.measure_mode_sub_${$selMeasure.val()}`).show();
		});

		// 	const event = {
		// 		type: "Ve_measure_clear_sticky",
		// 		player: window.currentPlayer.id,
		// 		time: (new Date).getTime()
		// 	};
		// 	d20.textchat.sendShout(event)

		d20.textchat.shoutref.on("value", function(e) {
			if (!d20.textchat.chatstartingup) {
				var t = e.val();
				if (t) {
					const msg = JSON.parse(t);
					if (window.DEBUG) console.log("SHOUT: ", msg);

					switch (msg.type) {
						// case "Ve_measure_clear_sticky": {
						// 	delete d20plus._stickyMeasure[msg.player];
						// 	d20.engine.debounced_renderTop();
						// }
					}
				}
			}
		});

		d20plus.mod.drawMeasurements();
	};

	d20plus.engine._addStatusEffectEntries = () => {
		const sheetUrl = window.is_gm ? d20plus.cfg.get("token", "statusSheetUrl") || d20plus.cfg.getDefault("token", "statusSheetUrl"): window.Campaign.attributes.bR20cfg_statussheet;

		const temp = new Image();
		temp.onload = () => {
			const xSize = 34;
			const iMin = 47;
			// const iMax = 101;
			const iMax = Math.ceil(temp.width / xSize); // round the last one up to a full image
			for (let i = iMin; i < iMax; ++i) {
				d20.token_editor.statusmarkers["5etools_" + (i - iMin)] = String(i * xSize);
			}
		};
		temp.src = sheetUrl;

		$(`#5etools-status-css`).html(`#radial-menu .markermenu .markericon {
				background-image: url(${sheetUrl});
			}`);
	};

	d20plus.engine._removeStatusEffectEntries = () => {
		$(`#5etools-status-css`).html("");
		Object.keys(d20.token_editor.statusmarkers).filter(k => k.startsWith("5etools_")).forEach(k => delete d20.token_editor.statusmarkers[k]);
	};

	d20plus.engine.enhanceStatusEffects = () => {
		d20plus.ut.log("Enhance status effects");
		$(`head`).append(`<style id="5etools-status-css"/>`);
		d20plus.cfg._handleStatusTokenConfigChange();

		d20plus.mod.overwriteStatusEffects();

		d20.engine.canvas.off("object:added");
		d20.engine.canvas.on("object:added", d20plus.mod.overwriteStatusEffects);

		// the holy trinity
		// d20.engine.canvas.on("object:removed", () => console.log("added"));
		// d20.engine.canvas.on("object:removed", () => console.log("removed"));
		// d20.engine.canvas.on("object:modified", () => console.log("modified"));

		$(document).off("mouseenter", ".markermenu");
		$(document).on("mouseenter", ".markermenu", d20plus.mod.mouseEnterMarkerMenu)
	};

	d20plus.engine.enhancePageSelector = () => {
		d20plus.ut.log("Enhancing page selector");
		var updatePageOrder = function () {
			d20plus.ut.log("Saving page order...");
			var pos = 0;
			$("#page-toolbar .pages .chooseablepage").each(function () {
				var page = d20.Campaign.pages.get($(this).attr("data-pageid"));
				page && page.save({
					placement: pos
				});
				pos++;
			});
			d20.pagetoolbar.noReload = false;
			d20.pagetoolbar.refreshPageListing();
		}

		function overwriteDraggables () {
			// make them draggable on both axes
			$("#page-toolbar .pages").sortable("destroy");
			$("#page-toolbar .pages").sortable({
				items: "> .chooseablepage",
				start: function () {
					d20.pagetoolbar.noReload = true;
				},
				stop: function () {
					updatePageOrder()
				},
				distance: 15
			}).addTouch();
			$("#page-toolbar .playerbookmark").draggable("destroy");
			$("#page-toolbar .playerbookmark").draggable({
				revert: "invalid",
				appendTo: "#page-toolbar",
				helper: "original"
			}).addTouch();
			$("#page-toolbar .playerspecificbookmark").draggable("destroy");
			$("#page-toolbar .playerspecificbookmark").draggable({
				revert: "invalid",
				appendTo: "#page-toolbar",
				helper: "original"
			}).addTouch();
		}

		overwriteDraggables();
		$(`#page-toolbar`).css("top", "calc(-90vh + 40px)");

		const originalFn = d20.pagetoolbar.refreshPageListing;
		d20.pagetoolbar.refreshPageListing = () => {
			originalFn();
			// original function is debounced at 100ms, so debounce this at 110ms and hope for the best
			_.debounce(() => {
				overwriteDraggables();
			}, 110)();
		}
	};

	d20plus.engine.initQuickSearch = ($iptSearch, $outSearch) => {
		$iptSearch.on("keyup", () => {
			const searchVal = ($iptSearch.val() || "").trim();
			$outSearch.empty();
			if (searchVal.length <= 2) return; // ignore 2 characters or less, for performance reasons
			const found = $(`#journal .content`).find(`li[data-itemid]`).filter((i, ele) => {
				const $ele = $(ele);
				return $ele.find(`.name`).text().trim().toLowerCase().includes(searchVal.toLowerCase());
			});
			if (found.length) {
				$outSearch.append(`<p><b>Search results:</b></p>`);
				const $outList = $(`<ol class="dd-list Vetools-search-results"/>`);
				$outSearch.append($outList);
				found.clone().addClass("Vetools-draggable").appendTo($outList);
				$outSearch.append(`<hr>`);
				$(`.Vetools-search-results .Vetools-draggable`).draggable({
					revert: true,
					distance: 10,
					revertDuration: 0,
					helper: "clone",
					handle: ".namecontainer",
					appendTo: "body",
					scroll: true,
					start: function () {
						$("#journalfolderroot").addClass("externaldrag")
					},
					stop: function () {
						$("#journalfolderroot").removeClass("externaldrag")
					}
				});
			}
		});
	};

	d20plus.engine.addSelectedTokenCommands = () => {
		d20plus.ut.log("Add token rightclick commands");
		$("#tmpl_actions_menu").replaceWith(d20plus.template_actionsMenu);

		Mousetrap.bind("b b", function () { // back on layer
			const n = d20plus.engine._getSelectedToMove();
			d20plus.engine.backwardOneLayer(n);
			return false;
		});

		Mousetrap.bind("b f", function () { // forward one layer
			const n = d20plus.engine._getSelectedToMove();
			d20plus.engine.forwardOneLayer(n);
			return false;
		});

		// BEGIN ROLL20 CODE
		var e, t = !1, n = [];
		var i = function() {
			t && (t.remove(),
				t = !1),
			e && clearTimeout(e)
		};
		var r = function (r) {
			var o, a;
			r.changedTouches && r.changedTouches.length > 0 ? (o = r.changedTouches[0].pageX,
				a = r.changedTouches[0].pageY) : (o = r.pageX,
				a = r.pageY),
				i(),
				n = [];
			for (var s = [], l = d20.engine.selected(), c = 0; c < l.length; c++)
				n.push(l[c]),
					s.push(l[c].type);
			if (s = _.uniq(s),
			n.length > 0)
				if (1 == s.length) {
					var u = n[0];
					t = $("image" == u.type && 0 == u.model.get("isdrawing") ? $("#tmpl_actions_menu").jqote(u.model) : $("#tmpl_actions_menu").jqote(u.model))
				} else {
					var u = n[0];
					t = $($("#tmpl_actions_menu").jqote(u.model))
				}
			else
				t = $($("#tmpl_actions_menu").jqote({}));
			if (!window.is_gm && t[0].lastElementChild.childElementCount < 1)
				return !1;
			t.appendTo("body");
			var d = t.height()
				, h = t.width()
				, p = {};
			return p.top = a > $("#editor-wrapper").height() - $("#playerzone").height() - d - 100 ? a - d + "px" : a + "px",
				p.left = o > $("#editor-wrapper").width() - h ? o + 10 - h + "px" : o + 10 + "px",
				t.css(p),
				$(".actions_menu").bind("mousedown mouseup touchstart", function(e) {
					e.stopPropagation()
				}),
				$(".actions_menu ul > li").bind("mouseover touchend", function() {
					if (e && (clearTimeout(e),
						e = !1),
					$(this).parents(".hasSub").length > 0)
						;
					else if ($(this).hasClass("hasSub")) {
						$(".actions_menu").css({
							width: "215px",
							height: "250px"
						});
						var t = this;
						_.defer(function() {
							$(".actions_menu ul.submenu").hide(),
								$(t).find("ul.submenu:hidden").show()
						})
					} else
						$(".actions_menu ul.submenu").hide()
				}),
				$(".actions_menu ul.submenu").live("mouseover", function() {
					e && (clearTimeout(e),
						e = !1)
				}),
				$(".actions_menu, .actions_menu ul.submenu").live("mouseleave", function() {
					e || (e = setTimeout(function() {
						$(".actions_menu ul.submenu").hide(),
							$(".actions_menu").css("width", "100px").css("height", "auto"),
							e = !1
					}, 500))
				}),
				$(".actions_menu li").on(clicktype, function() {
					var e = $(this).attr("data-action-type");
					if (null != e) {
						if ("copy" == e)
							d20.clipboard.doCopy(),
								i();
						else if ("paste" == e)
							d20.clipboard.doPaste(),
								i();
						else if ("delete" == e) {
							var t = d20.engine.selected();
							d20.engine.canvas.deactivateAllWithDispatch();
							for (var r = 0; r < t.length; r++)
								t[r].model.destroy();
							i()
						} else if ("undo" == e)
							d20.undo && d20.undo.doUndo(),
								i();
						else if ("tofront" == e)
							d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
								_.each(n, function(e) {
									d20.engine.canvas.bringToFront(e)
								}),
								d20.Campaign.activePage().debounced_recordZIndexes(),
								i();
						else if ("toback" == e)
							d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
								_.each(n, function(e) {
									d20.engine.canvas.sendToBack(e)
								}),
								d20.Campaign.activePage().debounced_recordZIndexes(),
								i();
						else if (-1 !== e.indexOf("tolayer_")) {
							d20.engine.unselect();
							var o = e.replace("tolayer_", "");
							_.each(n, function(e) {
								e.model.save({
									layer: o
								})
							}),
								i(),
								d20.token_editor.removeRadialMenu()
						} else if ("addturn" == e)
							_.each(n, function(e) {
								d20.Campaign.initiativewindow.addTokenToList(e.model.id)
							}),
								i(),
							d20.tutorial && d20.tutorial.active && $(document.body).trigger("addedTurn");
						else if ("group" == e) {
							var a = [];
							d20.engine.unselect(),
								_.each(n, function(e) {
									a.push(e.model.id)
								}),
								_.each(n, function(e) {
									e.model.addToGroup(a)
								}),
								i();
							var s = n[0];
							d20.engine.select(s)
						} else if ("ungroup" == e)
							d20.engine.unselect(),
								_.each(n, function(e) {
									e.model.clearGroup()
								}),
								d20.token_editor.removeRadialMenu(),
								i();
						else if ("toggledrawing" == e)
							d20.engine.unselect(),
								_.each(n, function(e) {
									e.model.set({
										isdrawing: !e.model.get("isdrawing")
									}).save()
								}),
								i(),
								d20.token_editor.removeRadialMenu();
						else if ("toggleflipv" == e)
							d20.engine.unselect(),
								_.each(n, function(e) {
									e.model.set({
										flipv: !e.model.get("flipv")
									}).save()
								}),
								i(),
								d20.token_editor.removeRadialMenu();
						else if ("togglefliph" == e)
							d20.engine.unselect(),
								_.each(n, function(e) {
									e.model.set({
										fliph: !e.model.get("fliph")
									}).save()
								}),
								i(),
								d20.token_editor.removeRadialMenu();
						else if ("takecard" == e)
							d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
								_.each(n, function(e) {
									var t = d20.decks.cardByID(e.model.get("cardid"));
									if (e.model.get("isdrawing") === !1)
										var n = {
											bar1_value: e.model.get("bar1_value"),
											bar1_max: e.model.get("bar1_max"),
											bar2_value: e.model.get("bar2_value"),
											bar2_max: e.model.get("bar2_max"),
											bar3_value: e.model.get("bar3_value"),
											bar3_max: e.model.get("bar3_max")
										};
									d20.Campaign.hands.addCardToHandForPlayer(t, window.currentPlayer, n ? n : void 0),
										_.defer(function() {
											e.model.destroy()
										})
								}),
								d20.engine.unselect(),
								i();
						else if ("flipcard" == e)
							d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
								_.each(n, function(e) {
									var t = e.model.get("sides").split("|")
										, n = e.model.get("currentSide")
										, i = n + 1;
									i > t.length - 1 && (i = 0),
										e.model.set({
											currentSide: i,
											imgsrc: unescape(t[i])
										}).save()
								}),
								i();
						else if ("setdimensions" == e) {
							var l = n[0]
								, c = $($("#tmpl_setdimensions").jqote()).dialog({
								title: "Set Dimensions",
								width: 325,
								height: 225,
								buttons: {
									Set: function() {
										var e, t;
										"pixels" == c.find(".dimtype").val() ? (e = parseInt(c.find("input.width").val(), 10),
											t = parseInt(c.find("input.height").val(), 10)) : (e = parseFloat(c.find("input.width").val()) * window.dpi,
											t = parseFloat(c.find("input.height").val()) * window.dpi),
											l.model.save({
												width: e,
												height: t
											}),
											c.off("change"),
											c.dialog("destroy").remove()
									},
									Cancel: function() {
										c.off("change"),
											c.dialog("destroy").remove()
									}
								},
								beforeClose: function() {
									c.off("change"),
										c.dialog("destroy").remove()
								}
							});
							c.on("change", ".dimtype", function() {
								"pixels" == $(this).val() ? (c.find("input.width").val(Math.round(l.get("width"))),
									c.find("input.height").val(Math.round(l.get("height")))) : (c.find("input.width").val(l.get("width") / window.dpi),
									c.find("input.height").val(l.get("height") / window.dpi))
							}),
								c.find(".dimtype").trigger("change"),
								i()
						} else if ("aligntogrid" == e)
							if (0 === d20.Campaign.activePage().get("snapping_increment")) {
								i();
								var u = $($("#tmpl_grid-disabled").jqote(h)).dialog({
									title: "Grid Off",
									buttons: {
										Ok: function() {
											u.off("change"),
												u.dialog("destroy").remove()
										}
									},
									beforeClose: function() {
										u.off("change"),
											u.dialog("destroy").remove()
									}
								})
							} else
								d20.engine.gridaligner.target = n[0],
									d20plus.setMode("gridalign"),
									i();
						else if ("side_random" == e) {
							d20.engine.canvas.getActiveGroup() && d20.engine.unselect();
							var d = [];
							_.each(n, function(e) {
								if (e.model && "" != e.model.get("sides")) {
									var t = e.model.get("sides").split("|")
										, n = t.length
										, i = d20.textchat.diceengine.random(n);

									const imgUrl = unescape(t[i]);
									e.model.save(getRollableTokenUpdate(imgUrl, i)),
										d.push(t[i])
								}
							}),
								d20.textchat.rawChatInput({
									type: "tokenroll",
									content: d.join("|")
								}),
								i()
						} else if ("side_choose" == e) {
							var l = n[0]
								, h = l.model.toJSON()
								, p = h.currentSide;
							h.sidesarray = h.sides.split("|");
							var c = $($("#tmpl_chooseside").jqote(h)).dialog({
								title: "Choose Side",
								width: 325,
								height: 225,
								buttons: {
									Choose: function() {
										const imgUrl = unescape(h.sidesarray[p]);
										d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
											l.model.save(getRollableTokenUpdate(imgUrl, p)),
											l = null,
											h = null,
											c.off("slide"),
											c.dialog("destroy").remove()
									},
									Cancel: function() {
										l = null,
											h = null,
											c.off("slide"),
											c.dialog("destroy").remove()
									}
								},
								beforeClose: function() {
									l = null,
										h = null,
										c.off("slide"),
										c.dialog("destroy").remove()
								}
							});
							c.find(".sideslider").slider({
								min: 0,
								max: h.sidesarray.length - 1,
								step: 1,
								value: h.currentSide
							}),
								c.on("slide", function(e, t) {
									t.value != p && (p = t.value,
										c.find(".sidechoices .sidechoice").hide().eq(t.value).show())
								}),
								c.find(".sidechoices .sidechoice").hide().eq(h.currentSide).show(),
								i()
						}
						// BEGIN MOD
						const showRollOptions = (formula, options) => {
							const sel = d20.engine.selected();

							options = options.map(it => `<option>${it}</option>`);

							const dialog= $("<div><p style='font-size: 1.15em;'><strong>" + d20.utils.strip_tags("Select Save") + ":</strong> <select style='width: 150px; margin-left: 5px;'>" + options.join("") + "</select></p></div>");

							dialog.dialog({
								title: "Input Value",
								beforeClose: function() {
									return false;
								},
								buttons: {
									Submit: function() {
										const val = dialog.find("select").val();
										console.log(val);
										d20.engine.unselect();
										sel.forEach(it => {
											d20.engine.select(it);
											const toRoll = formula(it, val);
											d20.textchat.doChatInput(toRoll);
											d20.engine.unselect();
										});

										dialog.off();
										dialog.dialog("destroy").remove();
										d20.textchat.$textarea.focus();
									},
									Cancel: function() {
										dialog.off();
										dialog.dialog("destroy").remove();
									}
								}
							});

							i();
						};

						if ("rollsaves" === e) {
							const options = ["str", "dex", "con", "int", "wis", "cha"].map(it => Parser.attAbvToFull(it));
							showRollOptions(
								(token, val) => `@{selected|wtype} &{template:simple} {{charname=@{selected|token_name}}} {{always=1}} {{rname=${val} Save}} {{mod=@{selected|${val.toLowerCase()}_save_bonus}}} {{r1=[[1d20+@{selected|${val.toLowerCase()}_save_bonus}]]}} {{r2=[[1d20+@{selected|${val.toLowerCase()}_save_bonus}]]}}`,
								options
							);
						} else if ("rollinit" === e) {
							const sel = d20.engine.selected();
							d20.engine.unselect();
							sel.forEach(it => {
								d20.engine.select(it);
								const toRoll = `@{selected|wtype} &{template:simple} {{rname=Initiative}} {{charname=@{selected|token_name}}} {{mod=[[@{selected|initiative_bonus}]]}} {{r1=[[@{selected|d20}+@{selected|dexterity_mod} &{tracker}]]}}{{normal=1}}`;
								d20.textchat.doChatInput(toRoll);
								d20.engine.unselect();
							});
							i();
						} else if ("rollskills" === e) {
							const options = [
								"Athletics",
								"Acrobatics",
								"Sleight of Hand",
								"Stealth",
								"Arcana",
								"History",
								"Investigation",
								"Nature",
								"Religion",
								"Animal Handling",
								"Insight",
								"Medicine",
								"Perception",
								"Survival",
								"Deception",
								"Intimidation",
								"Performance",
								"Persuasion"
							].sort();

							showRollOptions(
								(token, val) => {
									const clean = val.toLowerCase().replace(/ /g, "_");
									const abil = `${Parser.attAbvToFull(Parser.skillToAbilityAbv(val.toLowerCase())).toLowerCase()}_mod`;

									const doRoll = (atb = abil) => {
										return `@{selected|wtype} &{template:simple} {{charname=@{selected|token_name}}} {{always=1}} {{rname=${val}}} {{mod=@{selected|${atb}}}} {{r1=[[1d20+@{selected|${atb}}]]}} {{r2=[[1d20+@{selected|${atb}}]]}}`;
									}

									try {
										if (token && token.model && token.model.toJSON && token.model.toJSON().represents) {
											const charIdMaybe = token.model.toJSON().represents;
											if (!charIdMaybe) return doRoll();
											const charMaybe = d20.Campaign.characters.get(charIdMaybe);
											if (charMaybe) {
												const atbs = charMaybe.attribs.toJSON();
												const npcAtbMaybe = atbs.find(it => it.name === "npc");

												if (npcAtbMaybe && npcAtbMaybe.current == 1) {
													const npcClean = `npc_${clean}`;
													const bonusMaybe = atbs.find(it => it.name === npcClean);
													if (bonusMaybe) return doRoll(npcClean);
													else return doRoll();
												} else {
													const pcClean = `${clean}_bonus`;
													const bonusMaybe = atbs.find(it => it.name === pcClean);
													if (bonusMaybe) return doRoll(pcClean);
													else return doRoll();
												}
											} else return doRoll();
										} else return doRoll();
									} catch (x) {
										console.error(x);
										return doRoll();
									}
								},
								options
							);
						} else if ("forward-one" === e) {
							d20plus.engine.forwardOneLayer(n);
							i();
						} else if ("back-one" === e) {
							d20plus.engine.backwardOneLayer(n);
							i();
						} else if ("rollertokenresize" === e) {
							resizeToken();
							i();
						} else if ("paste-image" === e) {
							const mousePos = [...d20.engine.mousePos];
							const pageId = d20.Campaign.activePage().id;
							const layer = window.currentEditingLayer;

							const url = window.prompt("Enter a URL", d20plus.art.getLastImageUrl());

							if(!url) {
								i();
								return;
							}

							d20plus.art.setLastImageUrl(url);

							const img = new Image();
							img.onload = () => {
								const toCreate = {
									left: mousePos[0],
									top: mousePos[1],
									width: img.width,
									height: img.height,
									z_index: 0,
									imgsrc: url,
									rotation: 0,
									type: "image",
									page_id: pageId,
									layer,
									id: d20plus.ut.generateRowId()
								};

								const created = d20.Campaign.activePage().thegraphics.create(toCreate);
								created.save();
							};
							img.onerror = (...err) => {
								alert("Could not load image! See the console for more information.");
								console.error(...err);
							};
							img.src = url;
							i();
						} else if ("copy-tokenid" === e) {
							const sel = d20.engine.selected();
							window.prompt("Copy to clipboard: Ctrl+C, Enter", sel[0].model.id);
							i();
						}
						// END MOD
						return !1
					}
				}),
				!1
		};
		// END ROLL20 CODE

		function getRollableTokenUpdate (imgUrl, curSide) {
			const m = /\?roll20_token_size=(.*)/.exec(imgUrl);
			const toSave = {
				currentSide: curSide,
				imgsrc: imgUrl
			};
			if (m) {
				toSave.width = 70 * Number(m[1]);
				toSave.height = 70 * Number(m[1])
			}
			return toSave;
		}

		function resizeToken () {
			const sel = d20.engine.selected();

			const options = [["Tiny", 0.5], ["Small", 1], ["Medium", 1], ["Large", 2], ["Huge", 3], ["Gargantuan", 4], ["Colossal", 5]].map(it => `<option value='${it[1]}'>${it[0]}</option>`);
			const dialog = $(`<div><p style='font-size: 1.15em;'><strong>${d20.utils.strip_tags("Select Size")}:</strong> <select style='width: 150px; margin-left: 5px;'>${options.join("")}</select></p></div>`);
			dialog.dialog({
				title: "New Size",
				beforeClose: function () {
					return false;
				},
				buttons: {
					Submit: function () {
						const size = dialog.find("select").val();
						d20.engine.unselect();
						sel.forEach(it => {
							const nxtSize = size * 70;
							const sides = it.model.get("sides");
							if (sides) {
								const ueSides = unescape(sides);
								const cur = it.model.get("currentSide");
								const split = ueSides.split("|");
								if (split[cur].includes("roll20_token_size")) {
									split[cur] = split[cur].replace(/(\?roll20_token_size=).*/, `$1${size}`);
								} else {
									split[cur] += `?roll20_token_size=${size}`;
								}
								const toSaveSides = split.map(it => escape(it)).join("|");
								const toSave = {
									sides: toSaveSides,
									width: nxtSize,
									height: nxtSize
								};
								console.log(`Updating token:`, toSave);
								it.model.save(toSave);
							} else {
								console.warn("Token had no side data!")
							}
						});
						dialog.off();
						dialog.dialog("destroy").remove();
						d20.textchat.$textarea.focus();
					},
					Cancel: function () {
						dialog.off();
						dialog.dialog("destroy").remove();
					}
				}
			});
		}

		d20.token_editor.showContextMenu = r;
		d20.token_editor.closeContextMenu = i;
		$(`#editor-wrapper`).on("click", d20.token_editor.closeContextMenu);
	};

	d20plus.engine._getSelectedToMove = () => {
		const n = [];
		for (var l = d20.engine.selected(), c = 0; c < l.length; c++)
			n.push(l[c]);
	};

	d20plus.engine.forwardOneLayer = (n) => {
		d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
			_.each(n, function (e) {
				d20.engine.canvas.bringForward(e)
			}),
			d20.Campaign.activePage().debounced_recordZIndexes()
	};

	d20plus.engine.backwardOneLayer = (n) => {
		d20.engine.canvas.getActiveGroup() && d20.engine.unselect(),
			_.each(n, function (e) {
				d20.engine.canvas.sendBackwards(e)
			}),
			d20.Campaign.activePage().debounced_recordZIndexes()
	};

	d20plus.engine._tempTopRenderLines = {}, // format: {x: ..., y: ..., to_x: ..., to_y: ..., ticks: ..., offset: ...}
	// previously "enhanceSnap"
	d20plus.engine.enhanceMouseDown = () => {
		/**
		 * Dumb variable names copy-pasted from uglified code
		 * @param c x co-ord
		 * @param u y c-ord
		 * @returns {*[]} 2-len array; [0] = x and [1] = y
		 */
		function getClosestHexPoint (c, u) {
			function getEuclidDist (x1, y1, x2, y2) {
				return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
			}

			const hx = d20.canvas_overlay.activeHexGrid.GetHexAt({
				X: c,
				Y: u
			});

			let minDist = 1000000;
			let minPoint = [c, u];

			function checkDist(x1, y1) {
				const dist = getEuclidDist(x1, y1, c, u);
				if (dist < minDist) {
					minDist =  dist;
					minPoint = [x1, y1];
				}
			}
			hx.Points.forEach(pt => {
				checkDist(pt.X, pt.Y);
			});
			checkDist(hx.MidPoint.X, hx.MidPoint.Y);

			return minPoint;
		}

		// BEGIN ROLL20 CODE
		const R = function(e) {
			//BEGIN MOD
			var t = d20.engine.canvas;
			var a = $("#editor-wrapper");
			// END MOD
			var n, o;
			if (d20.tddice && d20.tddice.handleInteraction && d20.tddice.handleInteraction(),
				e.touches) {
				if ("pan" == d20.engine.mode)
					return;
				e.touches.length > 1 && (C = d20.engine.mode,
					d20.engine.mode = "pan",
					d20.engine.leftMouseIsDown = !0),
					d20.engine.lastTouchStarted = (new Date).getTime(),
					n = e.touches[0].pageX,
					o = e.touches[0].pageY,
					e.preventDefault()
			} else
				n = e.pageX,
					o = e.pageY;
			for (var r = d20.engine.showLastPaths.length; r--;)
				"selected" == d20.engine.showLastPaths[r].type && d20.engine.showLastPaths.splice(r, 1);
			d20.engine.handleMetaKeys(e),
			"select" != d20.engine.mode && "path" != d20.engine.mode || t.__onMouseDown(e),
			(0 === e.button || e.touches && 1 == e.touches.length) && (d20.engine.leftMouseIsDown = !0),
			2 === e.button && (d20.engine.rightMouseIsDown = !0);
			var s = Math.floor(n / d20.engine.canvasZoom + d20.engine.currentCanvasOffset[0] - d20.engine.paddingOffset[0] / d20.engine.canvasZoom)
				,
				l = Math.floor(o / d20.engine.canvasZoom + d20.engine.currentCanvasOffset[1] - d20.engine.paddingOffset[1] / d20.engine.canvasZoom);
			if (d20.engine.lastMousePos = [s, l],
				d20.engine.mousePos = [s, l],
			!d20.engine.leftMouseIsDown || "fog-reveal" != d20.engine.mode && "fog-hide" != d20.engine.mode && "gridalign" != d20.engine.mode) {
				if (d20.engine.leftMouseIsDown && "fog-polygonreveal" == d20.engine.mode) {
					// BEGIN MOD
					var c = s;
					var u = l;

					if (0 != d20.engine.snapTo && (e.shiftKey && !d20.Campaign.activePage().get("adv_fow_enabled") || !e.shiftKey && d20.Campaign.activePage().get("adv_fow_enabled"))) {
						if ("square" == d20.Campaign.activePage().get("grid_type")) {
							c = d20.engine.snapToIncrement(c, d20.engine.snapTo);
							u = d20.engine.snapToIncrement(u, d20.engine.snapTo);
						} else {
							const minPoint = getClosestHexPoint(c, u);
							c = minPoint[0];
							u = minPoint[1];
						}
					}

					if (d20.engine.fog.points.length > 0 && Math.abs(d20.engine.fog.points[0][0] - c) + Math.abs(d20.engine.fog.points[0][1] - u) < 15) {
						d20.engine.fog.points.push([d20.engine.fog.points[0][0], d20.engine.fog.points[0][1]]);
						d20.engine.finishPolygonReveal();
					} else {
						d20.engine.fog.points.push([c, u]);
					}
					d20.engine.drawOverlays();
					// END MOD
				} else if (d20.engine.leftMouseIsDown && "measure" == d20.engine.mode)
					if (2 === e.button)
						d20.engine.addWaypoint(e);
					else {
						d20.engine.measure.sticky && d20.engine.endMeasure(),
							d20.engine.measure.down[0] = s,
							d20.engine.measure.down[1] = l,
							d20.engine.measure.sticky = e.shiftKey;
						let t = d20.Campaign.activePage().get("grid_type")
							, n = "snap_center" === d20.engine.ruler_snapping && !e.altKey;
						if (n |= "no_snap" === d20.engine.ruler_snapping && e.altKey,
							n &= 0 !== d20.engine.snapTo)
							if ("square" === t)
								d20.engine.measure.down[1] = d20.engine.snapToIncrement(d20.engine.measure.down[1] + Math.floor(d20.engine.snapTo / 2), d20.engine.snapTo) - Math.floor(d20.engine.snapTo / 2),
									d20.engine.measure.down[0] = d20.engine.snapToIncrement(d20.engine.measure.down[0] + Math.floor(d20.engine.snapTo / 2), d20.engine.snapTo) - Math.floor(d20.engine.snapTo / 2);
							else {
								var d = d20.canvas_overlay.activeHexGrid.GetHexAt({
									X: d20.engine.measure.down[0],
									Y: d20.engine.measure.down[1]
								});
								d20.engine.measure.down[1] = d.MidPoint.Y,
									d20.engine.measure.down[0] = d.MidPoint.X
							}
						else if (0 === d20.engine.snapTo || "snap_corner" !== d20.engine.ruler_snapping || e.altKey)
							d20.engine.measure.flags |= 1;
						else {
							if ("square" === t)
								d20.engine.measure.down[0] = d20.engine.snapToIncrement(d20.engine.measure.down[0], d20.engine.snapTo),
									d20.engine.measure.down[1] = d20.engine.snapToIncrement(d20.engine.measure.down[1], d20.engine.snapTo);
							else {
								let e = d20.engine.snapToHexCorner([d20.engine.measure.down[0], d20.engine.measure.down[1]]);
								e && (d20.engine.measure.down[0] = e[0],
									d20.engine.measure.down[1] = e[1])
							}
							d20.engine.measure.flags |= 1
						}
					}
				else if (d20.engine.leftMouseIsDown && "fxtools" == d20.engine.mode)
					d20.engine.fx.current || (d20.engine.fx.current = d20.fx.handleClick(s, l));
				else if (d20.engine.leftMouseIsDown && "text" == d20.engine.mode) {
					var h = {
						fontFamily: $("#font-family").val(),
						fontSize: $("#font-size").val(),
						fill: $("#font-color").val(),
						text: "",
						left: s,
						top: l
					}
						, p = d20.Campaign.activePage().addText(h);
					_.defer(function () {
						d20.engine.editText(p.view.graphic, h.top, h.left),
							setTimeout(function () {
								$(".texteditor").focus()
							}, 300)
					})
				} else if (d20.engine.leftMouseIsDown && "rect" == d20.engine.mode) {
					var f = parseInt($("#path_width").val(), 10)
						, g = d20.engine.drawshape.shape = {
						strokewidth: f,
						x: 0,
						y: 0,
						width: 10,
						height: 10,
						type: e.altKey ? "circle" : "rect"
					};
					c = s,
						u = l;
					0 != d20.engine.snapTo && e.shiftKey && (c = d20.engine.snapToIncrement(c, d20.engine.snapTo),
						u = d20.engine.snapToIncrement(u, d20.engine.snapTo)),
						g.x = c,
						g.y = u,
						g.fill = $("#path_fillcolor").val(),
						g.stroke = $("#path_strokecolor").val(),
						d20.engine.drawshape.start = [n + d20.engine.currentCanvasOffset[0] - d20.engine.paddingOffset[0], o + d20.engine.currentCanvasOffset[1] - d20.engine.paddingOffset[1]],
						d20.engine.renderTop()
				} else if (d20.engine.leftMouseIsDown && "polygon" == d20.engine.mode) {
					if (d20.engine.drawshape.shape)
						g = d20.engine.drawshape.shape;
					else {
						f = parseInt($("#path_width").val(), 10);
						(g = d20.engine.drawshape.shape = {
							strokewidth: f,
							points: [],
							type: "polygon"
						}).fill = $("#path_fillcolor").val(),
							g.stroke = $("#path_strokecolor").val()
					}
					// BEGIN MOD
					var c = s;
					var u = l;

					if (0 != d20.engine.snapTo && e.shiftKey) {
						if ("square" == d20.Campaign.activePage().get("grid_type")) {
							c = d20.engine.snapToIncrement(c, d20.engine.snapTo);
							u = d20.engine.snapToIncrement(u, d20.engine.snapTo);
						} else {
							const minPoint = getClosestHexPoint(c, u);
							c = minPoint[0];
							u = minPoint[1];
						}
					}

					if (g.points.length > 0 && Math.abs(g.points[0][0] - c) + Math.abs(g.points[0][1] - u) < 15) {
						g.points.push([g.points[0][0], g.points[0][1]]);
						if (g.points.length > 2) {
							g.points.push([g.points[1][0], g.points[1][1]]);
						}
						d20.engine.finishCurrentPolygon();
					} else {
						g.points.push([c, u]);
					}

					d20.engine.debounced_renderTop();
					// END MOD
				} else if (d20.engine.leftMouseIsDown && "targeting" === d20.engine.mode) {
					var m = d20.engine.canvas.findTarget(e, !0, !0);
					return void (m !== undefined && "image" === m.type && m.model && d20.engine.nextTargetCallback(m))
				}
				// BEGIN MOD
				else if (d20.engine.leftMouseIsDown && "line_splitter" === d20.engine.mode) {
					const lastPoint = {x: d20.engine.lastMousePos[0], y: d20.engine.lastMousePos[1]};
					(d20.engine.canvas._objects || []).forEach(o => {
						if (o.type === "path" && o.containsPoint(lastPoint)) {
							const asObj = o.toObject();
							const anyCurves = asObj.path.filter(it => it instanceof Array && it.length > 0  && it[0] === "C");
							if (!anyCurves.length) {
								// PathMath expects these
								o.model.set("_pageid", d20.Campaign.activePage().get("id"));
								o.model.set("_path", JSON.stringify(o.path));

								console.log("SPLITTING PATH: ", o.model.toJSON());
								const mainPath = o.model;

								// BEGIN PathSplitter CODE
								let mainSegments = PathMath.toSegments(mainPath);
								// BEGIN MOD
								// fake a tiny diagonal line
								const SLICE_LEN = 10;
								const slicePoint1 = [lastPoint.x + (SLICE_LEN / 2), lastPoint.y + (SLICE_LEN / 2), 1];
								const slicePoint2 = [lastPoint.x - (SLICE_LEN / 2), lastPoint.y - (SLICE_LEN / 2), 1];
								const nuId = d20plus.ut.generateRowId();
								d20plus.engine._tempTopRenderLines[nuId] = {
									ticks: 2,
									x: slicePoint1[0],
									y: slicePoint1[1],
									to_x: slicePoint2[0],
									to_y: slicePoint2[1],
									offset: [...d20.engine.currentCanvasOffset]
								};
								setTimeout(() => {
									d20.engine.debounced_renderTop();
								}, 1);
								let splitSegments = [
									[slicePoint1, slicePoint2]
								];
								// END MOD
								let segmentPaths = _getSplitSegmentPaths(mainSegments, splitSegments);

								// (function moved into this scope)
								function _getSplitSegmentPaths(mainSegments, splitSegments) {
									let resultSegPaths = [];
									let curPathSegs = [];

									_.each(mainSegments, seg1 => {

										// Find the points of intersection and their parametric coefficients.
										let intersections = [];
										_.each(splitSegments, seg2 => {
											let i = PathMath.segmentIntersection(seg1, seg2);
											if(i) intersections.push(i);
										});

										if(intersections.length > 0) {
											// Sort the intersections in the order that they appear along seg1.
											intersections.sort((a, b) => {
												return a[1] - b[1];
											});

											let lastPt = seg1[0];
											_.each(intersections, i => {
												// Complete the current segment path.
												curPathSegs.push([lastPt, i[0]]);
												resultSegPaths.push(curPathSegs);

												// Start a new segment path.
												curPathSegs = [];
												lastPt = i[0];
											});
											curPathSegs.push([lastPt, seg1[1]]);
										}
										else {
											curPathSegs.push(seg1);
										}
									});
									resultSegPaths.push(curPathSegs);

									return resultSegPaths;
								};
								// (end function moved into this scope)

								// Convert the list of segment paths into paths.
								let _pageid = mainPath.get('_pageid');
								let controlledby = mainPath.get('controlledby');
								let fill = mainPath.get('fill');
								let layer = mainPath.get('layer');
								let stroke = mainPath.get('stroke');
								let stroke_width = mainPath.get('stroke_width');

								let results = [];
								_.each(segmentPaths, segments => {
									// BEGIN MOD
									if (!segments) {
										d20plus.chatLog(`A path had no segments! This is probably a bug. Please report it.`);
										return;
									}
									// END MOD

									let pathData = PathMath.segmentsToPath(segments);
									_.extend(pathData, {
										_pageid,
										controlledby,
										fill,
										layer,
										stroke,
										stroke_width
									});
									let path = createObj('path', pathData);
									results.push(path);
								});

								// Remove the original path and the splitPath.
								// BEGIN MOD
								mainPath.destroy();
								// END MOD
								// END PathSplitter CODE
							}
						}
					});
				}
				// END MOD
			} else
				d20.engine.fog.down[0] = s,
					d20.engine.fog.down[1] = l,
				0 != d20.engine.snapTo && "square" == d20.Campaign.activePage().get("grid_type") && ("gridalign" == d20.engine.mode ? e.shiftKey && (d20.engine.fog.down[0] = d20.engine.snapToIncrement(d20.engine.fog.down[0], d20.engine.snapTo),
					d20.engine.fog.down[1] = d20.engine.snapToIncrement(d20.engine.fog.down[1], d20.engine.snapTo)) : (e.shiftKey && !d20.Campaign.activePage().get("adv_fow_enabled") || !e.shiftKey && d20.Campaign.activePage().get("adv_fow_enabled")) && (d20.engine.fog.down[0] = d20.engine.snapToIncrement(d20.engine.fog.down[0], d20.engine.snapTo),
					d20.engine.fog.down[1] = d20.engine.snapToIncrement(d20.engine.fog.down[1], d20.engine.snapTo)));
			if (window.currentPlayer && d20.engine.leftMouseIsDown && "select" == d20.engine.mode) {
				if (2 === e.button && d20.engine.addWaypoint(e),
				d20.engine.pings[window.currentPlayer.id] && d20.engine.pings[window.currentPlayer.id].radius > 20)
					return;
				var y = {
					left: s,
					top: l,
					radius: -5,
					player: window.currentPlayer.id,
					pageid: d20.Campaign.activePage().id,
					currentLayer: window.currentEditingLayer
				};
				window.is_gm && e.shiftKey && (y.scrollto = !0),
					d20.engine.pings[window.currentPlayer.id] = y,
					d20.engine.pinging = {
						downx: n,
						downy: o
					},
					d20.engine.renderTop()
			}
			d20.engine.rightMouseIsDown && ("select" == d20.engine.mode || "path" == d20.engine.mode || "text" == d20.engine.mode) || d20.engine.leftMouseIsDown && "pan" == d20.engine.mode ? (d20.engine.pan.beginPos = [a.scrollLeft(), a.scrollTop()],
				d20.engine.pan.panXY = [n, o],
				d20.engine.pan.panning = !0) : d20.engine.pan.panning = !1,
			2 === e.button && !d20.engine.leftMouseIsDown && d20.engine.measurements[window.currentPlayer.id] && d20.engine.measurements[window.currentPlayer.id].sticky && (d20.engine.endMeasure(),
				d20.engine.announceEndMeasure({
					player: window.currentPlayer.id
				})),
				// BEGIN MOD
			$(`#upperCanvas`).hasClass("hasfocus") || $(`#upperCanvas`).focus()
			// END MOD
		};
		// END ROLL20 CODE

		if (UPPER_CANVAS_MOUSEDOWN_LIST.length) {
			UPPER_CANVAS_MOUSEDOWN = (UPPER_CANVAS_MOUSEDOWN_LIST.find(it => it.on === d20.engine.uppercanvas) || {}).listener;
		}

		if (UPPER_CANVAS_MOUSEDOWN) {
			d20plus.ut.log("Enhancing hex snap");
			d20.engine.uppercanvas.removeEventListener("mousedown", UPPER_CANVAS_MOUSEDOWN);
			d20.engine.uppercanvas.addEventListener("mousedown", R);
		}

		// add half-grid snap
		d20.engine.snapToIncrement = function(e, t) {
			if (d20plus.cfg.get("canvas", "halfGridSnap")) {
				t = t / 2;
			}
			return t * Math.round(e / t);
		}
	};

	d20plus.engine.enhanceMouseUp = () => { // P

	};

	d20plus.engine.enhanceMouseMove = () => {
		// needs to be called after `enhanceMeasureTool()`
		const $selMeasureMode = $(`#measure_mode`);
		const $selRadMode = $(`#measure_mode_sel_2`);
		const $iptConeWidth = $(`#measure_mode_ipt_3`);
		const $selConeMode = $(`#measure_mode_sel_3`);
		const $selBoxMode = $(`#measure_mode_sel_4`);
		const $selLineMode = $(`#measure_mode_sel_5`);
		const $iptLineWidth = $(`#measure_mode_ipt_5`);

		// BEGIN ROLL20 CODE
		var x = function(e) {
			e.type = "measuring",
				e.time = (new Date).getTime(),
				d20.textchat.sendShout(e)
		}
			, k = _.throttle(x, 200)
			, E = function(e) {
			k(e),
			d20.tutorial && d20.tutorial.active && $(document.body).trigger("measure"),
				d20.engine.receiveMeasureUpdate(e)
		};
		// END ROLL20 CODE

		// add missing vars
		var t = d20.engine.canvas;
		var a = $("#editor-wrapper");

		// BEGIN ROLL20 CODE
		const A = function(e) {
			var n, i;
			if (e.changedTouches ? ((e.changedTouches.length > 1 || "pan" == d20.engine.mode) && (delete d20.engine.pings[window.currentPlayer.id],
				d20.engine.pinging = !1),
				e.preventDefault(),
				n = e.changedTouches[0].pageX,
				i = e.changedTouches[0].pageY) : (n = e.pageX,
				i = e.pageY),
			"select" != d20.engine.mode && "path" != d20.engine.mode && "targeting" != d20.engine.mode || t.__onMouseMove(e),
			d20.engine.leftMouseIsDown || d20.engine.rightMouseIsDown) {
				var o = Math.floor(n / d20.engine.canvasZoom + d20.engine.currentCanvasOffset[0] - d20.engine.paddingOffset[0] / d20.engine.canvasZoom)
					, r = Math.floor(i / d20.engine.canvasZoom + d20.engine.currentCanvasOffset[1] - d20.engine.paddingOffset[1] / d20.engine.canvasZoom);
				if (d20.engine.mousePos = [o, r],
				!d20.engine.leftMouseIsDown || "fog-reveal" != d20.engine.mode && "fog-hide" != d20.engine.mode && "gridalign" != d20.engine.mode) {
					if (d20.engine.leftMouseIsDown && "measure" == d20.engine.mode && d20.engine.measure.down[0] !== undefined && d20.engine.measure.down[1] !== undefined) {
						d20.engine.measure.down[2] = o,
							d20.engine.measure.down[3] = r,
							d20.engine.measure.sticky |= e.shiftKey;
						let t = d20.Campaign.activePage().get("grid_type")
							, n = "snap_corner" === d20.engine.ruler_snapping && !e.altKey && 0 !== d20.engine.snapTo
							, i = "snap_center" === d20.engine.ruler_snapping && !e.altKey;
						if (i |= "no_snap" === d20.engine.ruler_snapping && e.altKey,
							i &= 0 !== d20.engine.snapTo) {
							if ("square" === t)
								d20.engine.measure.down[2] = d20.engine.snapToIncrement(d20.engine.measure.down[2] + Math.floor(d20.engine.snapTo / 2), d20.engine.snapTo) - Math.floor(d20.engine.snapTo / 2),
									d20.engine.measure.down[3] = d20.engine.snapToIncrement(d20.engine.measure.down[3] + Math.floor(d20.engine.snapTo / 2), d20.engine.snapTo) - Math.floor(d20.engine.snapTo / 2);
							else {
								let e = d20.canvas_overlay.activeHexGrid.GetHexAt({
									X: d20.engine.measure.down[2],
									Y: d20.engine.measure.down[3]
								});
								e && (d20.engine.measure.down[3] = e.MidPoint.Y,
									d20.engine.measure.down[2] = e.MidPoint.X)
							}
							d20.engine.measure.flags &= -3
						} else if (n) {
							if ("square" === t)
								d20.engine.measure.down[2] = d20.engine.snapToIncrement(d20.engine.measure.down[2], d20.engine.snapTo),
									d20.engine.measure.down[3] = d20.engine.snapToIncrement(d20.engine.measure.down[3], d20.engine.snapTo);
							else {
								let e = d20.engine.snapToHexCorner([d20.engine.measure.down[2], d20.engine.measure.down[3]]);
								e && (d20.engine.measure.down[2] = e[0],
									d20.engine.measure.down[3] = e[1])
							}
							d20.engine.measure.flags |= 2
						} else
							d20.engine.measure.flags |= 2;
						var s = {
							x: d20.engine.measure.down[0],
							y: d20.engine.measure.down[1],
							to_x: d20.engine.measure.down[2],
							to_y: d20.engine.measure.down[3],
							player: window.currentPlayer.id,
							pageid: d20.Campaign.activePage().id,
							currentLayer: window.currentEditingLayer,
							waypoints: d20.engine.measure.waypoints,
							sticky: d20.engine.measure.sticky,
							flags: d20.engine.measure.flags,
							hide: d20.engine.measure.hide
							// BEGIN MOD
							,
							Ve: {
								mode: $selMeasureMode.val(),
								radius: {
									mode: $selRadMode.val()
								},
								cone: {
									arc: $iptConeWidth.val(),
									mode: $selConeMode.val()
								},
								box: {
									mode: $selBoxMode.val(),
								},
								line: {
									mode: $selLineMode.val(),
									width: $iptLineWidth.val()
								}
							}
							// END MOD
						};
						d20.engine.announceMeasure(s)
					} else if (d20.engine.leftMouseIsDown && "fxtools" == d20.engine.mode) {
						if (d20.engine.fx.current) {
							var l = (new Date).getTime();
							l - d20.engine.fx.lastMoveBroadcast > d20.engine.fx.MOVE_BROADCAST_FREQ ? (d20.fx.moveFx(d20.engine.fx.current, o, r),
								d20.engine.fx.lastMoveBroadcast = l) : d20.fx.moveFx(d20.engine.fx.current, o, r, !0)
						}
					} else if (d20.engine.leftMouseIsDown && "rect" == d20.engine.mode) {
						var c = (n + d20.engine.currentCanvasOffset[0] - d20.engine.paddingOffset[0] - d20.engine.drawshape.start[0]) / d20.engine.canvasZoom
							, u = (i + d20.engine.currentCanvasOffset[1] - d20.engine.paddingOffset[1] - d20.engine.drawshape.start[1]) / d20.engine.canvasZoom;
						0 != d20.engine.snapTo && e.shiftKey && (c = d20.engine.snapToIncrement(c, d20.engine.snapTo),
							u = d20.engine.snapToIncrement(u, d20.engine.snapTo));
						var d = d20.engine.drawshape.shape;
						d.width = c,
							d.height = u,
							d20.engine.renderTop()
					}
				} else
					d20.engine.fog.down[2] = o,
						d20.engine.fog.down[3] = r,
					0 != d20.engine.snapTo && "square" == d20.Campaign.activePage().get("grid_type") && ("gridalign" == d20.engine.mode ? e.shiftKey && (d20.engine.fog.down[2] = d20.engine.snapToIncrement(d20.engine.fog.down[2], d20.engine.snapTo),
						d20.engine.fog.down[3] = d20.engine.snapToIncrement(d20.engine.fog.down[3], d20.engine.snapTo)) : (e.shiftKey && !d20.Campaign.activePage().get("adv_fow_enabled") || !e.shiftKey && d20.Campaign.activePage().get("adv_fow_enabled")) && (d20.engine.fog.down[2] = d20.engine.snapToIncrement(d20.engine.fog.down[2], d20.engine.snapTo),
						d20.engine.fog.down[3] = d20.engine.snapToIncrement(d20.engine.fog.down[3], d20.engine.snapTo))),
						d20.engine.drawOverlays();
				if (d20.engine.pinging)
					(c = Math.abs(d20.engine.pinging.downx - n)) + (u = Math.abs(d20.engine.pinging.downy - i)) > 10 && (delete d20.engine.pings[window.currentPlayer.id],
						d20.engine.pinging = !1);
				if (d20.engine.pan.panning) {
					c = 2 * (n - d20.engine.pan.panXY[0]),
						u = 2 * (i - d20.engine.pan.panXY[1]);
					if (d20.engine.pan.lastPanDist += Math.abs(c) + Math.abs(u),
					d20.engine.pan.lastPanDist < 10)
						return;
					var h = d20.engine.pan.beginPos[0] - c
						, p = d20.engine.pan.beginPos[1] - u;
					a.stop().animate({
						scrollLeft: h,
						scrollTop: p
					}, {
						duration: 1500,
						easing: "easeOutExpo",
						queue: !1
					})
				}
			}
		};
		// END ROLL20 CODE

		if (UPPER_CANVAS_MOUSEMOVE_LIST.length) {
			UPPER_CANVAS_MOUSEMOVE = (UPPER_CANVAS_MOUSEMOVE_LIST.find(it => it.on === d20.engine.uppercanvas) || {}).listener;
		}

		if (UPPER_CANVAS_MOUSEMOVE) {
			d20plus.ut.log("Enhancing mouse move");
			d20.engine.uppercanvas.removeEventListener("mousemove", UPPER_CANVAS_MOUSEMOVE);
			d20.engine.uppercanvas.addEventListener("mousemove", A);
		}
	};

	d20plus.engine.addLineCutterTool = () => {
		const $btnTextTool = $(`.choosetext`);

		const $btnSplitTool = $(`<li class="choosesplitter">✂️ Line Splitter</li>`).click(() => {
			d20plus.setMode("line_splitter");
		});

		$btnTextTool.after($btnSplitTool);
	};

	d20plus.engine._tokenHover = null;
	d20plus.engine._drawTokenHover = () => {
		$(`.Vetools-token-hover`).remove();
		if (!d20plus.engine._tokenHover || !d20plus.engine._tokenHover.text) return;

		const pt = d20plus.engine._tokenHover.pt;
		const txt = unescape(d20plus.engine._tokenHover.text);

		const scaleFact = (1 / d20.engine.canvasZoom);
		const xOffset = pt.x > (d20.engine.canvasWidth / 2) ? -300 * scaleFact : 0;

		$(`body`).append(`<div class="Vetools-token-hover" style="top: ${pt.y}px; left: ${pt.x + xOffset}px">${txt}</div>`);
	};
	d20plus.engine.addTokenHover = () => {
		// BEGIN ROLL20 CODE
		d20.engine.drawOverlaysTop = function(e) {
			e.globalCompositeOperation = "lighter";
			d20.fx.render(e);
			e.globalCompositeOperation = "source-over";
			d20.engine.redrawSightTokens(e);
			d20.engine.drawShadowMovements(e);
			d20.engine.drawMeasurements(e);
			d20.engine.drawPings(e);
			d20.engine.drawInProgressDrawings(e);

			// BEGIN MOD
			d20plus.engine._drawTokenHover();
			// END MOD
		};
		// END ROLL20 CODE

		// store data for the rendering function to access
		d20.engine.canvas.on("mouse:move", (data, ...others) => {
			// enable hover from GM layer -> token layer
			let hoverTarget = data.target;
			if (data.e && window.currentEditingLayer === "gmlayer") {
				const cache = window.currentEditingLayer;
				window.currentEditingLayer = "objects";
				hoverTarget = d20.engine.canvas.findTarget(data.e, null, true);
				window.currentEditingLayer = cache;
			}

			if (data.e.shiftKey && hoverTarget && hoverTarget.model) {
				d20.engine.debounced_renderTop();
				const gmNotes = hoverTarget.model.get("gmnotes");
				const pt = d20.engine.canvas.getPointer(data.e);
				pt.x -= d20.engine.currentCanvasOffset[0];
				pt.y -= d20.engine.currentCanvasOffset[1];
				d20plus.engine._tokenHover = {
					pt: pt,
					text: gmNotes,
					id: hoverTarget.model.id
				};
			} else {
				if (d20plus.engine._tokenHover) d20.engine.debounced_renderTop();
				d20plus.engine._tokenHover = null;
			}
		})
	};

	d20plus.engine.enhanceMarkdown = () => {
		const OUT_STRIKE = "<span style='text-decoration: line-through'>$1</span>";

		// BEGIN ROLL20 CODE
		window.Markdown.parse = function(e) {
			{
				var t = e
					, n = []
					, i = [];
				-1 != t.indexOf("\r\n") ? "\r\n" : -1 != t.indexOf("\n") ? "\n" : ""
			}
			return t = t.replace(/{{{([\s\S]*?)}}}/g, function(e) {
				return n.push(e.substring(3, e.length - 3)),
					"{{{}}}"
			}),
				t = t.replace(new RegExp("<pre>([\\s\\S]*?)</pre>","gi"), function(e) {
					return i.push(e.substring(5, e.length - 6)),
						"<pre></pre>"
				}),
				// BEGIN MOD
				t = t.replace(/~~(.*?)~~/g, OUT_STRIKE),
				// END MOD
				t = t.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"),
				t = t.replace(/\*(.*?)\*/g, "<em>$1</em>"),
				t = t.replace(/``(.*?)``/g, "<code>$1</code>"),
				t = t.replace(/\[([^\]]+)\]\(([^)]+(\.png|\.gif|\.jpg|\.jpeg))\)/g, '<a href="$2"><img src="$2" alt="$1" /></a>'),
				t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'),
				t = t.replace(new RegExp("<pre></pre>","g"), function() {
					return "<pre>" + i.shift() + "</pre>"
				}),
				t = t.replace(/{{{}}}/g, function() {
					return n.shift()
				})
		}
		// END ROLL20 CODE

		// after a short delay, replace any old content in the chat
		setTimeout(() => {
			$(`.message`).each(function () {
				$(this).html($(this).html().replace(/~~(.*?)~~/g, OUT_STRIKE))
			})
		}, 2500);
	};

	d20plus.engine.enhancePathWidths = () => {
		const $selThicc = $(`#path_width`).css("width", "150px");
		$selThicc.append(`
				<option value="5">Custom 1 (5 px.)</option>
				<option value="5">Custom 2 (5 px.)</option>
				<option value="5">Custom 3 (5 px.)</option>
			`);
		const $iptThicc = $(`<input type="number" style="max-width: 50px;">`).hide();
		const $lblPixels = $(`<label style="display: inline-flex;"> pixels</label>`).hide();
		$selThicc.after($lblPixels).after($iptThicc);

		let $selOpt = null;
		$selThicc.on("change", () => {
			$selOpt = $selThicc.find(`option:selected`);
			const txt = $selOpt.text();
			if (txt.startsWith("Custom")) {
				const thicc = /\((.*?) px\.\)/.exec(txt)[1];
				$lblPixels.show();
				$iptThicc.show().val(Number(thicc));
			} else {
				$lblPixels.hide();
				$iptThicc.hide();
			}
		});

		$iptThicc.on("keyup", () => {
			if (!$selOpt) $selOpt = $selThicc.find(`option:selected`);
			if ($selOpt) {
				const clean = Math.round(Math.max(1, Number($iptThicc.val())));
				$selOpt.val(`${clean}`);
				$selOpt.text($selOpt.text().replace(/\(\d+ px\.\)/, `(${clean} px.)`));
				d20.engine.canvas.freeDrawingBrush.width = clean;
			}
		});
	};

	d20plus.engine.enhanceTransmogrifier = () => {
		JqueryUtil.addSelectors();

		$("#transmogrifier").on("click", () => {
			setTimeout(() => {
				const $btnAlpha = $(`#vetools-transmog-alpha`);
				if (!$btnAlpha.length) {
					const $prependTarget = $(`.ui-dialog-title:textEquals(Transmogrifier)`).first().parent().parent().find(`.ui-dialog-content`);
					$(`<button id="#vetools-transmog-alpha" class="btn btn default" style="margin-bottom: 5px;">Sort Items Alphabetically</button>`).on("click", () => {
						// coped from a bookmarklet
						$('iframe').contents().find('.objects').each((c,e)=>{ let $e=$(e); $e.children().sort( (a,b)=>{ let name1=$(a).find(".name").text().toLowerCase(), name2=$(b).find(".name").text().toLowerCase(), comp = name1.localeCompare(name2); return comp; }) .each((i,c)=>$e.append(c)); });
					}).prependTo($prependTarget);
				}
			}, 5);
		})
	};

	d20plus.engine.addWeather = () => {
		window.force = false; // missing variable in Roll20's code(?); define it here
		const MAX_ZOOM = 2.5; // max canvas zoom
		const tmp = []; // temp vector
		// cache images
		const IMAGES = {
			"Rain": new Image,
			"Snow": new Image,
			"Fog": new Image
		};
		IMAGES.Rain.src = "https://i.imgur.com/lZrqiVk.png";
		IMAGES.Snow.src = "https://i.imgur.com/uwLQjWY.png";
		IMAGES.Fog.src = "https://i.imgur.com/SRsUpHW.png";
		const $wrpEditor = $("#editor-wrapper");

		// add custom canvas
		const $wrpCanvas = $wrpEditor.find(".canvas-container");
		const $canvasWeather = $("<canvas id='Vet-canvas-weather' style='position: absolute; z-index: 6; left:0; top: 0; pointer-events: none;' tabindex='-1'/>").appendTo($wrpCanvas);
		const cv = $canvasWeather[0];
		d20.engine.weathercanvas = cv;

		// add our canvas to those adjusted when canvas size changes
		const cachedSetCanvasSize = d20.engine.setCanvasSize;
		d20.engine.setCanvasSize = function (e, n) {
			cv.width = e;
			cv.height = n;
			cachedSetCanvasSize(e, n);
		};

		d20.engine.setCanvasSize($wrpEditor[0].clientWidth, $wrpEditor[0].clientHeight);

		// const page = d20.Campaign.activePage();
		const ctx = cv.getContext("2d");

		function ofX (x) {
			return x - d20.engine.currentCanvasOffset[0];
		}

		function ofY (y) {
			return y - d20.engine.currentCanvasOffset[1];
		}

		function lineIntersectsBounds (points, bounds) {
			return d20plus.math.doPolygonsIntersect([points[0], points[2], points[3], points[1]], bounds);
		}

		function copyPoints (toCopy) {
			return [...toCopy.map(pt => [...pt])];
		}

		function getDirectionRotation () {
			const dir = Campaign.attributes.bR20cfg_weatherDir1;
			switch (dir) {
				case "Northerly": return 0.25 * Math.PI;
				case "North-Easterly": return 0.5 * Math.PI;
				case "Easterly": return 0.75 * Math.PI;
				case "South-Easterly": return Math.PI;
				case "Southerly": return 1.25 * Math.PI;
				case "South-Westerly": return 1.5 * Math.PI;
				case "Westerly": return 1.75 * Math.PI;
				case "North-Westerly": return 0;
				default: return 0;
			}
		}

		function getIntensity () {
			const tint = Campaign.attributes.bR20cfg_weatherIntensity1;
			switch (tint) {
				case "Heavy": return 1;
				default: return 0;
			}
		}

		function getTintColor () {
			const tint = Campaign.attributes.bR20cfg_weatherTint1;
			switch (tint) {
				case "Night": return "#4c566d80";
				default: return null;
			}
		}

		let accum = 0;
		let then = 0;
		let image;
		function drawFrame (now) {
			const deltaTime = now - then;
			then = now;

			if (Campaign && Campaign.attributes && Campaign.attributes.bR20cfg_weatherType1 !== "None") {
				image = IMAGES[Campaign.attributes.bR20cfg_weatherType1];

				ctx.clearRect(0, 0, cv.width, cv.height);
				const hasImage = image && image.complete;
				const tint = getTintColor();
				const scaledW = Math.ceil((image.width * d20.engine.canvasZoom) / MAX_ZOOM);
				const scaledH = Math.ceil((image.height * d20.engine.canvasZoom) / MAX_ZOOM);
				if (hasImage || tint) {
					// draw weather
					if (
						hasImage &&
						!(scaledW <= 0 || scaledH <= 0) // sanity check
					) {
						const rot = getDirectionRotation();
						const w = scaledW;
						const h = scaledH;
						const boundingBox = [[-w, -h], [-w, cv.height + h], [cv.width + w, cv.height + h], [cv.width + w, -h]];
						const BASE_OFFSET_X = -w / 2;
						const BASE_OFFSET_Y = -h / 2;

						// calculate resultant points of a rotated shape
						const pt00 = [0, 0];
						const pt01 = [0, 1];
						const pt10 = [1, 0];
						const pt11 = [1, 1];
						const basePts = [
							pt00,
							pt01,
							pt10,
							pt11
						].map(pt => [
							(pt[0] * w) + BASE_OFFSET_X,
							(pt[1] * h) + BASE_OFFSET_Y
						]);
						basePts.forEach(pt => d20plus.math.vec2.rotate(pt, pt, [0, 0], rot));

						// calculate animation values
						const speed = Campaign.attributes.bR20cfg_weatherSpeed1 || 0.1;
						const speedFactor = speed * d20.engine.canvasZoom;
						accum += deltaTime;
						const maxAccum = Math.floor(scaledW / speedFactor);
						if (accum >= maxAccum) accum -= maxAccum;
						const intensity = getIntensity() * speedFactor;
						const timeOffsetX = Math.ceil(speedFactor * accum);
						const timeOffsetY = Math.ceil(speedFactor * accum);

						// DEBUG TEXT
						ctx.font = "30px Arial";
						ctx.fillStyle = "#ff00ff";
						ctx.fillText(`FPS: ${(1 / (deltaTime / 1000)).toFixed(2)}`, 100, 50);
						ctx.fillText(`Accumulated time: ${accum.toFixed(2)}`, 100, 100);
						ctx.fillText(`Sin: ${Math.sin(accum).toFixed(4)}`, 100, 150);
						ctx.fillText(`Cos: ${Math.cos(accum).toFixed(4)}`, 100, 200);

						//// rotate coord space
						ctx.rotate(rot);

						// draw base image
						doDraw(0, 0);

						function doDraw (offsetX, offsetY) {
							ctx.drawImage(
								image,
								BASE_OFFSET_X + timeOffsetX + offsetX,
								BASE_OFFSET_Y + timeOffsetY + offsetY,
								scaledW,
								scaledH
							);
						}

						function inBounds (nextPts) {
							return lineIntersectsBounds(nextPts, boundingBox);
						}

						function moveXDir (pt, i, isAdd) {
							if (i % 2) d20plus.math.vec2.sub(tmp, basePts[3], basePts[1]);
							else d20plus.math.vec2.sub(tmp, basePts[2], basePts[0]);

							if (isAdd) d20plus.math.vec2.add(pt, pt, tmp);
							else d20plus.math.vec2.sub(pt, pt, tmp);
						}

						function moveYDir (pt, i, isAdd) {
							if (i > 1) d20plus.math.vec2.sub(tmp, basePts[3], basePts[2]);
							else d20plus.math.vec2.sub(tmp, basePts[1], basePts[0]);

							if (isAdd) d20plus.math.vec2.add(pt, pt, tmp);
							else d20plus.math.vec2.sub(pt, pt, tmp);
						}

						const getMaxMoves = () => {
							let maxMovesX, maxMovesY, nxtPtsInc, nxtPtsDec;

							// calculate max steps
							// x direction
							nxtPtsInc = copyPoints(basePts);
							nxtPtsDec = copyPoints(basePts);
							maxMovesX = 0;
							while(lineIntersectsBounds(nxtPtsInc, boundingBox) || lineIntersectsBounds(nxtPtsDec, boundingBox)) {
								nxtPtsInc.forEach((pt, i) => moveXDir(pt, i, true));
								nxtPtsDec.forEach((pt, i) => moveXDir(pt, i, false));
								maxMovesX++;
							}

							nxtPtsInc = copyPoints(basePts);
							nxtPtsDec = copyPoints(basePts);
							maxMovesY = 0;
							while(lineIntersectsBounds(nxtPtsInc, boundingBox) || lineIntersectsBounds(nxtPtsDec, boundingBox)) {
								nxtPtsInc.forEach((pt, i) => moveYDir(pt, i, true));
								nxtPtsDec.forEach((pt, i) => moveYDir(pt, i, false));
								maxMovesY++;
							}

							return [maxMovesX > maxMovesY ? "x" : "y", Math.max(maxMovesX, maxMovesY)];
						};

						const handleXAxisYIncrease = (nxtPts, maxMoves, moves, xDir) => {
							const handleY = (dir) => {
								let subNxtPts, subMoves;
								subNxtPts = copyPoints(nxtPts);
								subMoves = 0;
								while(subMoves <= maxMoves[1]) {
									subNxtPts.forEach((pt, i) => moveYDir(pt, i, dir > 0));
									subMoves++;
									if (inBounds(subNxtPts)) doDraw(xDir * moves * w, dir * (subMoves * h));
								}
							};

							handleY(1); // y axis increasing
							handleY(-1); // y axis decreasing
						};

						const handleYAxisXIncrease = (nxtPts, maxMoves, moves, yDir) => {
							const handleX = (dir) => {
								let subNxtPts, subMoves;
								subNxtPts = copyPoints(nxtPts);
								subMoves = 0;
								while(subMoves <= maxMoves[1]) {
									subNxtPts.forEach((pt, i) => moveXDir(pt, i, dir > 0));
									subMoves++;
									if (lineIntersectsBounds(subNxtPts, boundingBox)) doDraw(dir * (subMoves * w), yDir * moves * h);
								}
							};

							handleX(1); // x axis increasing
							handleX(-1); // x axis decreasing
						};

						const handleBasicX = () => {
							const handleX = (dir) => {
								let nxtPts, moves;
								nxtPts = copyPoints(basePts);
								moves = 0;
								while(lineIntersectsBounds(nxtPts, boundingBox)) {
									nxtPts.forEach((pt, i) => moveXDir(pt, i, dir > 0));
									moves++;
									if (lineIntersectsBounds(nxtPts, boundingBox)) doDraw(dir * (moves * w), 0);
								}
							};

							handleX(1); // x axis increasing
							handleX(-1); // x axis decreasing
						};

						const handleBasicY = () => {
							const handleY = (dir) => {
								let nxtPts, moves;
								nxtPts = copyPoints(basePts);
								moves = 0;
								while(lineIntersectsBounds(nxtPts, boundingBox)) {
									nxtPts.forEach((pt, i) => moveYDir(pt, i, dir > 0));
									moves++;
									if (lineIntersectsBounds(nxtPts, boundingBox)) doDraw(0, dir * (moves * h));
								}
							};

							handleY(1); // y axis increasing
							handleY(-1); // y axis decreasing
						};

						(() => {
							// choose largest axis
							const maxMoves = getMaxMoves();

							if (maxMoves[0] === "x") {
								const handleX = (dir) => {
									let nxtPts, moves;
									nxtPts = copyPoints(basePts);
									moves = 0;
									while(moves < maxMoves[1]) {
										nxtPts.forEach((pt, i) => moveXDir(pt, i, dir > 0));
										moves++;
										if (lineIntersectsBounds(nxtPts, boundingBox)) doDraw(dir * (moves * w), 0);
										handleXAxisYIncrease(nxtPts, maxMoves, moves, dir);
									}
								};

								handleBasicY();
								handleX(1); // x axis increasing
								handleX(-1); // x axis decreasing
							} else {
								const handleY = (dir) => {
									let nxtPts, moves;
									nxtPts = copyPoints(basePts);
									moves = 0;
									while(moves < maxMoves[1]) {
										nxtPts.forEach((pt, i) => moveYDir(pt, i, dir > 0));
										moves++;
										if (lineIntersectsBounds(nxtPts, boundingBox)) doDraw(0, dir * (moves * h));
										handleYAxisXIncrease(nxtPts, maxMoves, moves, dir);
									}
								};

								handleBasicX();
								handleY(1); // y axis increasing
								handleY(-1); // y axis decreasing
							}
						})();

						//// revert coord space rotation
						ctx.rotate(-rot);
					}

					if ((hasImage && Math.round(3.1) !== 3)
						&& !(scaledW <= 0 || scaledH <= 0)) {

						const speed = Campaign.attributes.bR20cfg_weatherSpeed1 || 0.1;
						const speedFactor = speed * d20.engine.canvasZoom;
						accum += deltaTime;
						const maxAccum = Math.floor(scaledW / speedFactor);
						if (accum >= maxAccum) accum -= maxAccum;
						const intensity = getIntensity() * speedFactor;

						// draw weather
						const timeOffsetX = Math.ceil(speedFactor * accum);
						const timeOffsetY = Math.ceil(speedFactor * accum);

						const basePosX = ofX(Math.round((-scaledW / 2) + timeOffsetX));
						const basePosY = ofY(Math.round((-scaledH / 2) + timeOffsetY));

						const tileOffsetX = scaledW / speedFactor;
						const tileOffsetY = scaledH / speedFactor;
						const offsetRotX = scaledW / 2;
						const offsetRotY = scaledH / 2;
						const rot = getDirectionRotation();

						// DEBUG TEXT
						ctx.font = "30px Arial";
						ctx.fillStyle = "#ff00ff";
						ctx.fillText(`FPS: ${(1 / (deltaTime / 1000)).toFixed(2)}`, 100, 50);
						ctx.fillText(`Accumulated time: ${accum.toFixed(2)}`, 100, 100);
						ctx.fillText(`Sin: ${Math.sin(accum).toFixed(4)}`, 100, 150);
						ctx.fillText(`Cos: ${Math.cos(accum).toFixed(4)}`, 100, 200);

						// tile to fill the render area // TODO cull off-screen stuff? This is extremely slow. Also, NE ~75% speed has holes
						for (let posX = basePosX - tileOffsetX; posX < cv.width + tileOffsetX; posX += scaledW) {
							for (let posY = basePosY - tileOffsetY; posY < cv.height + tileOffsetY; posY += scaledH) {
								ctx.translate(offsetRotX, offsetRotY);
								ctx.rotate(rot);

								ctx.drawImage(image, posX - offsetRotX, posY - offsetRotY, scaledW, scaledH);

								if (intensity) {
									for (let i = 0; i < intensity; ++i) {
										ctx.drawImage(
											image,
											(posX - offsetRotX) + (i * 50 / speedFactor), // TODO make these vary with time? Sin/Cos?
											(posY - offsetRotY) + (i * 50 / speedFactor),
											scaledW,
											scaledH
										);
									}
								}

								ctx.rotate(-rot);
								ctx.translate(-offsetRotX, -offsetRotY);
							}
						}

					}

					// draw tint
					if (tint) {
						ctx.fillStyle = tint;
						ctx.fillRect(0, 0, cv.width, cv.height);
					}
				}

				requestAnimationFrame(drawFrame);
			} else {
				// if weather is disabled, maintain a background tick
				ctx.clearRect(0, 0, cv.width, cv.height);
				setTimeout(() => {
					drawFrame(0);
				}, 1000);
			}
		}

		requestAnimationFrame(drawFrame);
	};
}

SCRIPT_EXTENSIONS.push(d20plusEngine);
