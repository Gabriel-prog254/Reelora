(function () {
    "use strict";

    var Profiles = window.Profiles;

    if (location.search.indexOf("signout=1") !== -1) {
        try {
            localStorage.removeItem("cinemoraProfile");
        } catch (e) { /* ignore */ }
    }
    var CARDS = document.getElementById("profile-cards");
    var TITLE = document.getElementById("profile-title");
    var MANAGE_BTN = document.getElementById("manage-btn");
    var ADD_BTN = document.getElementById("add-profile-btn");
    var ADD_FORM = document.getElementById("add-profile-form");
    var ADD_NAME = document.getElementById("add-name");
    var ADD_SAVE = document.getElementById("add-save");
    var ADD_CANCEL = document.getElementById("add-cancel");
    var AVATAR_PICKER = document.getElementById("avatar-picker");
    var TOAST = document.getElementById("toast");

    var managing = false;
    var chosenAvatar = null;

    function toast(message) {
        TOAST.textContent = message;
        TOAST.hidden = false;
        setTimeout(function () {
            TOAST.hidden = true;
        }, 2200);
    }

    function buildAvatarPicker() {
        AVATAR_PICKER.innerHTML = "";
        Profiles.avatarIds.forEach(function (id) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.setAttribute("data-avatar", id);
            btn.innerHTML = '<img src="' + Profiles.avatar(id) + '" alt="Avatar">';
            btn.addEventListener("click", function () {
                AVATAR_PICKER.querySelectorAll("button").forEach(function (b) {
                    b.classList.remove("selected");
                });
                btn.classList.add("selected");
                chosenAvatar = Profiles.avatar(id);
            });
            AVATAR_PICKER.appendChild(btn);
        });
        var first = AVATAR_PICKER.querySelector("button");
        if (first) {
            first.classList.add("selected");
            chosenAvatar = Profiles.avatar(Profiles.avatarIds[0]);
        }
    }

    function render() {
        var list = Profiles.all();

        CARDS.classList.toggle("managing", managing);
        TITLE.textContent = managing ? "Manage Profiles" : "Who's watching?";

        CARDS.innerHTML = "";

        list.forEach(function (profile) {
            var card = document.createElement("div");
            card.className = "pcard";
            card.setAttribute("role", "button");
            card.setAttribute("tabindex", "0");
            card.setAttribute("aria-label", "Enter " + profile.name);

            var imgBox = document.createElement("span");
            imgBox.className = "pcard-img";
            imgBox.innerHTML = '<img src="' + profile.img + '" alt="' + profile.name + '">' +
                '<button class="pcard-remove" aria-label="Remove ' + profile.name + '">✕</button>';
            imgBox.querySelector(".pcard-remove").addEventListener("click", function (e) {
                e.stopPropagation();
                if (Profiles.remove(profile.name)) {
                    render();
                    toast("Profile removed");
                }
            });

            var name = document.createElement("span");
            name.textContent = profile.name;

            card.appendChild(imgBox);
            card.appendChild(name);

            var enter = function () {
                if (managing) {
                    return;
                }
                Profiles.activate(profile.name);
                location.href = "index.html";
            };

            card.addEventListener("click", enter);
            card.addEventListener("keydown", function (e) {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    enter();
                }
            });

            CARDS.appendChild(card);
        });

        if (!managing) {
            var add = document.createElement("button");
            add.type = "button";
            add.className = "pcard";
            add.innerHTML = '<span class="pcard-img"><span class="add-tile">+</span></span><span>Add Profile</span>';
            add.addEventListener("click", openAddForm);
            CARDS.appendChild(add);
        }
    }

    function openAddForm() {
        if (Profiles.all().length >= Profiles.MAX) {
            toast("You have reached the profile limit.");
            return;
        }
        ADD_NAME.value = "";
        ADD_FORM.hidden = false;
        ADD_NAME.focus();
    }

    ADD_BTN.addEventListener("click", openAddForm);
    ADD_CANCEL.addEventListener("click", function () {
        ADD_FORM.hidden = true;
    });

    ADD_SAVE.addEventListener("click", function () {
        if (Profiles.add(ADD_NAME.value, chosenAvatar)) {
            ADD_FORM.hidden = true;
            render();
            toast("Profile added");
        } else if (ADD_NAME.value.trim()) {
            toast("That name is already used or invalid.");
        }
    });

    ADD_NAME.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            e.preventDefault();
            ADD_SAVE.click();
        }
    });

    MANAGE_BTN.addEventListener("click", function () {
        managing = !managing;
        render();
    });

    buildAvatarPicker();
    render();
})();