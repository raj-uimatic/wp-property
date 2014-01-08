var qq = qq || {};

qq.extend = function(first, second) {
    for (var prop in second) first[prop] = second[prop];
}, qq.indexOf = function(arr, elt, from) {
    if (arr.indexOf) return arr.indexOf(elt, from);
    from = from || 0;
    var len = arr.length;
    for (0 > from && (from += len); len > from; from++) if (from in arr && arr[from] === elt) return from;
    return -1;
}, qq.getUniqueId = function() {
    var id = 0;
    return function() {
        return id++;
    };
}(), qq.attach = function(element, type, fn) {
    element.addEventListener ? element.addEventListener(type, fn, !1) : element.attachEvent && element.attachEvent("on" + type, fn);
}, qq.detach = function(element, type, fn) {
    element.removeEventListener ? element.removeEventListener(type, fn, !1) : element.attachEvent && element.detachEvent("on" + type, fn);
}, qq.preventDefault = function(e) {
    e.preventDefault ? e.preventDefault() : e.returnValue = !1;
}, qq.insertBefore = function(a, b) {
    b.parentNode.insertBefore(a, b);
}, qq.remove = function(element) {
    element.parentNode.removeChild(element);
}, qq.contains = function(parent, descendant) {
    return parent == descendant ? !0 : parent.contains ? parent.contains(descendant) : !!(8 & descendant.compareDocumentPosition(parent));
}, qq.toElement = function() {
    var div = document.createElement("div");
    return function(html) {
        div.innerHTML = html;
        var element = div.firstChild;
        return div.removeChild(element), element;
    };
}(), qq.css = function(element, styles) {
    null != styles.opacity && "string" != typeof element.style.opacity && "undefined" != typeof element.filters && (styles.filter = "alpha(opacity=" + Math.round(100 * styles.opacity) + ")"), 
    qq.extend(element.style, styles);
}, qq.hasClass = function(element, name) {
    var re = new RegExp("(^| )" + name + "( |$)");
    return re.test(element.className);
}, qq.addClass = function(element, name) {
    qq.hasClass(element, name) || (element.className += " " + name);
}, qq.removeClass = function(element, name) {
    var re = new RegExp("(^| )" + name + "( |$)");
    element.className = element.className.replace(re, " ").replace(/^\s+|\s+$/g, "");
}, qq.setText = function(element, text) {
    jQuery(element).html(text);
}, qq.children = function(element) {
    for (var children = [], child = element.firstChild; child; ) 1 == child.nodeType && children.push(child), 
    child = child.nextSibling;
    return children;
}, qq.getByClass = function(element, className) {
    if (element.querySelectorAll) return element.querySelectorAll("." + className);
    for (var result = [], candidates = element.getElementsByTagName("*"), len = candidates.length, i = 0; len > i; i++) qq.hasClass(candidates[i], className) && result.push(candidates[i]);
    return result;
}, qq.obj2url = function(obj, temp, prefixDone) {
    var uristrings = [], prefix = "&", add = function(nextObj, i) {
        var nextTemp = temp ? /\[\]$/.test(temp) ? temp : temp + "[" + i + "]" : i;
        "undefined" != nextTemp && "undefined" != i && uristrings.push("object" == typeof nextObj ? qq.obj2url(nextObj, nextTemp, !0) : "[object Function]" === Object.prototype.toString.call(nextObj) ? encodeURIComponent(nextTemp) + "=" + encodeURIComponent(nextObj()) : encodeURIComponent(nextTemp) + "=" + encodeURIComponent(nextObj));
    };
    if (!prefixDone && temp) prefix = /\?/.test(temp) ? /\?$/.test(temp) ? "" : "&" : "?", 
    uristrings.push(temp), uristrings.push(qq.obj2url(obj)); else if ("[object Array]" === Object.prototype.toString.call(obj) && "undefined" != typeof obj) for (var i = 0, len = obj.length; len > i; ++i) add(obj[i], i); else if ("undefined" != typeof obj && null !== obj && "object" == typeof obj) for (var i in obj) add(obj[i], i); else uristrings.push(encodeURIComponent(temp) + "=" + encodeURIComponent(obj));
    return uristrings.join(prefix).replace(/^&/, "").replace(/%20/g, "+");
};

var qq = qq || {};

qq.FileUploaderBasic = function(o) {
    this._options = {
        debug: !1,
        action: "/server/upload",
        params: {},
        button: null,
        multiple: !1,
        maxConnections: 3,
        allowedExtensions: [ "jpg", "gif", "png" ],
        sizeLimit: 0,
        minSizeLimit: 0,
        onSubmit: function() {},
        onProgress: function() {},
        onComplete: function() {},
        onCancel: function() {},
        messages: {
            typeError: "{file} has invalid extension. Only {extensions} are allowed.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
        },
        showMessage: function(message) {
            alert(message);
        }
    }, qq.extend(this._options, o), this._filesInProgress = 0, this._handler = this._createUploadHandler(), 
    this._options.button && (this._button = this._createUploadButton(this._options.button)), 
    this._preventLeaveInProgress();
}, qq.FileUploaderBasic.prototype = {
    setParams: function(params) {
        this._options.params = params;
    },
    getInProgress: function() {
        return this._filesInProgress;
    },
    _createUploadButton: function(element) {
        var self = this;
        return new qq.UploadButton({
            element: element,
            multiple: this._options.multiple && qq.UploadHandlerXhr.isSupported(),
            onChange: function(input) {
                self._onInputChange(input);
            }
        });
    },
    _createUploadHandler: function() {
        var handlerClass, self = this;
        handlerClass = qq.UploadHandlerXhr.isSupported() ? "UploadHandlerXhr" : "UploadHandlerForm";
        var handler = new qq[handlerClass]({
            debug: this._options.debug,
            action: this._options.action,
            maxConnections: this._options.maxConnections,
            onProgress: function(id, fileName, loaded, total) {
                self._onProgress(id, fileName, loaded, total), self._options.onProgress(id, fileName, loaded, total);
            },
            onComplete: function(id, fileName, result) {
                self._onComplete(id, fileName, result), self._options.onComplete(id, fileName, result);
            },
            onCancel: function(id, fileName) {
                self._onCancel(id, fileName), self._options.onCancel(id, fileName);
            }
        });
        return handler;
    },
    _preventLeaveInProgress: function() {
        var self = this;
        qq.attach(window, "beforeunload", function(e) {
            if (self._filesInProgress) {
                var e = e || window.event;
                return e.returnValue = self._options.messages.onLeave, self._options.messages.onLeave;
            }
        });
    },
    _onSubmit: function() {
        this._filesInProgress++;
    },
    _onProgress: function() {},
    _onComplete: function(id, fileName, result) {
        this._filesInProgress--, result.error && this._options.showMessage(result.error);
    },
    _onCancel: function() {
        this._filesInProgress--;
    },
    _onInputChange: function(input) {
        this._handler instanceof qq.UploadHandlerXhr ? this._uploadFileList(input.files) : this._validateFile(input) && this._uploadFile(input), 
        this._button.reset();
    },
    _uploadFileList: function(files) {
        for (var i = 0; i < files.length; i++) if (!this._validateFile(files[i])) return;
        for (var i = 0; i < files.length; i++) this._uploadFile(files[i]);
    },
    _uploadFile: function(fileContainer) {
        var id = this._handler.add(fileContainer), fileName = this._handler.getName(id);
        this._options.onSubmit(id, fileName) !== !1 && (this._onSubmit(id, fileName), this._handler.upload(id, this._options.params));
    },
    _validateFile: function(file) {
        var name, size;
        return file.value ? name = file.value.replace(/.*(\/|\\)/, "") : (name = null != file.fileName ? file.fileName : file.name, 
        size = null != file.fileSize ? file.fileSize : file.size), this._isAllowedExtension(name) ? 0 === size ? (this._error("emptyError", name), 
        !1) : size && this._options.sizeLimit && size > this._options.sizeLimit ? (this._error("sizeError", name), 
        !1) : size && size < this._options.minSizeLimit ? (this._error("minSizeError", name), 
        !1) : !0 : (this._error("typeError", name), !1);
    },
    _error: function(code, fileName) {
        function r(name, replacement) {
            message = message.replace(name, replacement);
        }
        var message = this._options.messages[code];
        r("{file}", this._formatFileName(fileName)), r("{extensions}", this._options.allowedExtensions.join(", ")), 
        r("{sizeLimit}", this._formatSize(this._options.sizeLimit)), r("{minSizeLimit}", this._formatSize(this._options.minSizeLimit)), 
        this._options.showMessage(message);
    },
    _formatFileName: function(name) {
        return name.length > 33 && (name = name.slice(0, 19) + "..." + name.slice(-13)), 
        name;
    },
    _isAllowedExtension: function(fileName) {
        var ext = -1 !== fileName.indexOf(".") ? fileName.replace(/.*[.]/, "").toLowerCase() : "", allowed = this._options.allowedExtensions;
        if (!allowed.length) return !0;
        for (var i = 0; i < allowed.length; i++) if (allowed[i].toLowerCase() == ext) return !0;
        return !1;
    },
    _formatSize: function(bytes) {
        var i = -1;
        do bytes /= 1024, i++; while (bytes > 99);
        return Math.max(bytes, .1).toFixed(1) + [ "kB", "MB", "GB", "TB", "PB", "EB" ][i];
    }
}, qq.FileUploader = function(o) {
    qq.FileUploaderBasic.apply(this, arguments), qq.extend(this._options, {
        element: null,
        listElement: null,
        template: '<div class="qq-uploader"><div class="qq-upload-drop-area"><span>' + wpp.strings.drop_file + '</span></div><div class="qq-upload-button">' + wpp.strings.upload_images + '</div><ul class="qq-upload-list"></ul></div>',
        fileTemplate: '<li><span class="qq-upload-file"></span><a class="qq-upload-cancel" href="#">' + wpp.strings.cancel + '</a><span class="qq-upload-spinner"></span><span class="qq-upload-size"></span><span class="qq-upload-failed-text">' + wpp.strings.fail + "</span></li>",
        classes: {
            button: "qq-upload-button",
            drop: "qq-upload-drop-area",
            dropActive: "qq-upload-drop-area-active",
            list: "qq-upload-list",
            file: "qq-upload-file",
            spinner: "qq-upload-spinner",
            size: "qq-upload-size",
            cancel: "qq-upload-cancel",
            success: "qq-upload-success",
            fail: "qq-upload-fail"
        }
    }), qq.extend(this._options, o), this._element = this._options.element, this._element.innerHTML = this._options.template, 
    this._listElement = this._options.listElement || this._find(this._element, "list"), 
    this._classes = this._options.classes, this._button = this._createUploadButton(this._find(this._element, "button")), 
    this._bindCancelEvent(), this._setupDragDrop();
}, qq.extend(qq.FileUploader.prototype, qq.FileUploaderBasic.prototype), qq.extend(qq.FileUploader.prototype, {
    _find: function(parent, type) {
        var element = qq.getByClass(parent, this._options.classes[type])[0];
        if (!element) throw new Error("element not found " + type);
        return element;
    },
    _setupDragDrop: function() {
        var self = this, dropArea = this._find(this._element, "drop"), dz = new qq.UploadDropZone({
            element: dropArea,
            onEnter: function(e) {
                qq.addClass(dropArea, self._classes.dropActive), e.stopPropagation();
            },
            onLeave: function(e) {
                e.stopPropagation();
            },
            onLeaveNotDescendants: function() {
                qq.removeClass(dropArea, self._classes.dropActive);
            },
            onDrop: function(e) {
                dropArea.style.display = "none", qq.removeClass(dropArea, self._classes.dropActive), 
                self._uploadFileList(e.dataTransfer.files);
            }
        });
        dropArea.style.display = "none", qq.attach(document, "dragenter", function(e) {
            dz._isValidFileDrag(e) && (dropArea.style.display = "block");
        }), qq.attach(document, "dragleave", function(e) {
            if (dz._isValidFileDrag(e)) {
                var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
                relatedTarget && "HTML" != relatedTarget.nodeName || (dropArea.style.display = "none");
            }
        });
    },
    _onSubmit: function(id, fileName) {
        qq.FileUploaderBasic.prototype._onSubmit.apply(this, arguments), this._addToList(id, fileName);
    },
    _onProgress: function(id, fileName, loaded, total) {
        qq.FileUploaderBasic.prototype._onProgress.apply(this, arguments);
        var item = this._getItemByFileId(id), size = this._find(item, "size"), percent_load = Math.round(loaded / total * 100);
        size.style.display = "block";
        var text;
        text = loaded != total ? 50 > percent_load ? '<span style="width: ' + percent_load + '%" class="wpp_upload_progress"></span><span class="wpp_upload_progress_text">' + percent_load + "% of " + this._formatSize(total) + "</span>" : '<span style="width: ' + percent_load + '%" class="wpp_upload_progress"><span class="wpp_upload_progress_text">' + percent_load + "% of " + this._formatSize(total) + "</span></span>" : this._formatSize(total), 
        qq.setText(size, text);
    },
    _onComplete: function(id, fileName, result) {
        qq.FileUploaderBasic.prototype._onComplete.apply(this, arguments);
        var item = this._getItemByFileId(id);
        qq.remove(this._find(item, "cancel")), qq.remove(this._find(item, "spinner")), result.success ? qq.addClass(item, this._classes.success) : qq.addClass(item, this._classes.fail);
    },
    _addToList: function(id, fileName) {
        var item = qq.toElement(this._options.fileTemplate);
        item.qqFileId = id;
        var fileElement = this._find(item, "file");
        qq.setText(fileElement, wpp.strings.uploading + ": " + this._formatFileName(fileName)), 
        this._find(item, "size").style.display = "none", this._listElement.appendChild(item);
    },
    _getItemByFileId: function(id) {
        for (var item = this._listElement.firstChild; item; ) {
            if (item.qqFileId == id) return item;
            item = item.nextSibling;
        }
    },
    _bindCancelEvent: function() {
        var self = this, list = this._listElement;
        qq.attach(list, "click", function(e) {
            e = e || window.event;
            var target = e.target || e.srcElement;
            if (qq.hasClass(target, self._classes.cancel)) {
                qq.preventDefault(e);
                var item = target.parentNode;
                self._handler.cancel(item.qqFileId), qq.remove(item);
            }
        });
    }
}), qq.UploadDropZone = function(o) {
    this._options = {
        element: null,
        onEnter: function() {},
        onLeave: function() {},
        onLeaveNotDescendants: function() {},
        onDrop: function() {}
    }, qq.extend(this._options, o), this._element = this._options.element, this._disableDropOutside(), 
    this._attachEvents();
}, qq.UploadDropZone.prototype = {
    _disableDropOutside: function() {
        qq.UploadDropZone.dropOutsideDisabled || (qq.attach(document, "dragover", function(e) {
            e.dataTransfer && (e.dataTransfer.dropEffect = "none", e.preventDefault());
        }), qq.UploadDropZone.dropOutsideDisabled = !0);
    },
    _attachEvents: function() {
        var self = this;
        qq.attach(self._element, "dragover", function(e) {
            if (self._isValidFileDrag(e)) {
                var effect = e.dataTransfer.effectAllowed;
                e.dataTransfer.dropEffect = "move" == effect || "linkMove" == effect ? "move" : "copy", 
                e.stopPropagation(), e.preventDefault();
            }
        }), qq.attach(self._element, "dragenter", function(e) {
            self._isValidFileDrag(e) && self._options.onEnter(e);
        }), qq.attach(self._element, "dragleave", function(e) {
            if (self._isValidFileDrag(e)) {
                self._options.onLeave(e);
                var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
                qq.contains(this, relatedTarget) || self._options.onLeaveNotDescendants(e);
            }
        }), qq.attach(self._element, "drop", function(e) {
            self._isValidFileDrag(e) && (e.preventDefault(), self._options.onDrop(e));
        });
    },
    _isValidFileDrag: function(e) {
        var dt = e.dataTransfer, isWebkit = navigator.userAgent.indexOf("AppleWebKit") > -1;
        return dt && "none" != dt.effectAllowed && (dt.files || !isWebkit && dt.types.contains && dt.types.contains("Files"));
    }
}, qq.UploadButton = function(o) {
    this._options = {
        element: null,
        multiple: !1,
        name: "file",
        onChange: function() {},
        hoverClass: "qq-upload-button-hover",
        focusClass: "qq-upload-button-focus"
    }, qq.extend(this._options, o), this._element = this._options.element, qq.css(this._element, {
        position: "relative",
        overflow: "hidden",
        direction: "ltr"
    }), this._input = this._createInput();
}, qq.UploadButton.prototype = {
    getInput: function() {
        return this._input;
    },
    reset: function() {
        this._input.parentNode && qq.remove(this._input), qq.removeClass(this._element, this._options.focusClass), 
        this._input = this._createInput();
    },
    _createInput: function() {
        var input = document.createElement("input");
        this._options.multiple && input.setAttribute("multiple", "multiple"), input.setAttribute("type", "file"), 
        input.setAttribute("name", this._options.name), qq.css(input, {
            position: "absolute",
            right: 0,
            top: 0,
            fontFamily: "Arial",
            fontSize: "118px",
            margin: 0,
            padding: 0,
            cursor: "pointer",
            opacity: 0
        }), this._element.appendChild(input);
        var self = this;
        return qq.attach(input, "change", function() {
            self._options.onChange(input);
        }), qq.attach(input, "mouseover", function() {
            qq.addClass(self._element, self._options.hoverClass);
        }), qq.attach(input, "mouseout", function() {
            qq.removeClass(self._element, self._options.hoverClass);
        }), qq.attach(input, "focus", function() {
            qq.addClass(self._element, self._options.focusClass);
        }), qq.attach(input, "blur", function() {
            qq.removeClass(self._element, self._options.focusClass);
        }), window.attachEvent && input.setAttribute("tabIndex", "-1"), input;
    }
}, qq.UploadHandlerAbstract = function(o) {
    this._options = {
        debug: !1,
        action: "/upload.php",
        maxConnections: 999,
        onProgress: function() {},
        onComplete: function() {},
        onCancel: function() {}
    }, qq.extend(this._options, o), this._queue = [], this._params = [];
}, qq.UploadHandlerAbstract.prototype = {
    log: function(str) {
        this._options.debug && window.console && console.log("[uploader] " + str);
    },
    add: function() {},
    upload: function(id, params) {
        var len = this._queue.push(id), copy = {};
        qq.extend(copy, params), this._params[id] = copy, len <= this._options.maxConnections && this._upload(id, this._params[id]);
    },
    cancel: function(id) {
        this._cancel(id), this._dequeue(id);
    },
    cancelAll: function() {
        for (var i = 0; i < this._queue.length; i++) this._cancel(this._queue[i]);
        this._queue = [];
    },
    getName: function() {},
    getSize: function() {},
    getQueue: function() {
        return this._queue;
    },
    _upload: function() {},
    _cancel: function() {},
    _dequeue: function(id) {
        var i = qq.indexOf(this._queue, id);
        this._queue.splice(i, 1);
        var max = this._options.maxConnections;
        if (this._queue.length >= max && max > i) {
            var nextId = this._queue[max - 1];
            this._upload(nextId, this._params[nextId]);
        }
    }
}, qq.UploadHandlerForm = function() {
    qq.UploadHandlerAbstract.apply(this, arguments), this._inputs = {};
}, qq.extend(qq.UploadHandlerForm.prototype, qq.UploadHandlerAbstract.prototype), 
qq.extend(qq.UploadHandlerForm.prototype, {
    add: function(fileInput) {
        fileInput.setAttribute("name", "qqfile");
        var id = "qq-upload-handler-iframe" + qq.getUniqueId();
        return this._inputs[id] = fileInput, fileInput.parentNode && qq.remove(fileInput), 
        id;
    },
    getName: function(id) {
        return this._inputs[id].value.replace(/.*(\/|\\)/, "");
    },
    _cancel: function(id) {
        this._options.onCancel(id, this.getName(id)), delete this._inputs[id];
        var iframe = document.getElementById(id);
        iframe && (iframe.setAttribute("src", "javascript:false;"), qq.remove(iframe));
    },
    _upload: function(id, params) {
        var input = this._inputs[id];
        if (!input) throw new Error("file with passed id was not added, or already uploaded or cancelled");
        var fileName = this.getName(id);
        params.qqfile = fileName;
        var iframe = this._createIframe(id), form = this._createForm(iframe, params);
        form.appendChild(input);
        var self = this;
        return this._attachLoadEvent(iframe, function() {
            self.log("iframe loaded");
            var response = self._getIframeContentJSON(iframe);
            self._options.onComplete(id, fileName, response), self._dequeue(id), delete self._inputs[id], 
            setTimeout(function() {
                qq.remove(iframe);
            }, 1);
        }), form.submit(), qq.remove(form), id;
    },
    _attachLoadEvent: function(iframe, callback) {
        qq.attach(iframe, "load", function() {
            iframe.parentNode && (iframe.contentDocument && iframe.contentDocument.body && "false" == iframe.contentDocument.body.innerHTML || callback());
        });
    },
    _getIframeContentJSON: function(iframe) {
        var doc = iframe.contentDocument ? iframe.contentDocument : iframe.contentWindow.document, response;
        this.log("converting iframe's innerHTML to JSON"), this.log("innerHTML = " + doc.body.innerHTML);
        try {
            response = eval("(" + doc.body.innerHTML + ")");
        } catch (err) {
            response = {};
        }
        return response;
    },
    _createIframe: function(id) {
        var iframe = qq.toElement('<iframe src="javascript:false;" name="' + id + '" />');
        return iframe.setAttribute("id", id), iframe.style.display = "none", document.body.appendChild(iframe), 
        iframe;
    },
    _createForm: function(iframe, params) {
        var form = qq.toElement('<form method="post" enctype="multipart/form-data"></form>'), queryString = qq.obj2url(params, this._options.action);
        return form.setAttribute("action", queryString), form.setAttribute("target", iframe.name), 
        form.style.display = "none", document.body.appendChild(form), form;
    }
}), qq.UploadHandlerXhr = function() {
    qq.UploadHandlerAbstract.apply(this, arguments), this._files = [], this._xhrs = [], 
    this._loaded = [];
}, qq.UploadHandlerXhr.isSupported = function() {
    var input = document.createElement("input");
    return input.type = "file", "multiple" in input && "undefined" != typeof File && "undefined" != typeof new XMLHttpRequest().upload;
}, qq.extend(qq.UploadHandlerXhr.prototype, qq.UploadHandlerAbstract.prototype), 
qq.extend(qq.UploadHandlerXhr.prototype, {
    add: function(file) {
        if (!(file instanceof File)) throw new Error("Passed obj in not a File (in qq.UploadHandlerXhr)");
        return this._files.push(file) - 1;
    },
    getName: function(id) {
        var file = this._files[id];
        return null != file.fileName ? file.fileName : file.name;
    },
    getSize: function(id) {
        var file = this._files[id];
        return null != file.fileSize ? file.fileSize : file.size;
    },
    getLoaded: function(id) {
        return this._loaded[id] || 0;
    },
    _upload: function(id, params) {
        {
            var file = this._files[id], name = this.getName(id);
            this.getSize(id);
        }
        this._loaded[id] = 0;
        var xhr = this._xhrs[id] = new XMLHttpRequest(), self = this;
        xhr.upload.onprogress = function(e) {
            e.lengthComputable && (self._loaded[id] = e.loaded, self._options.onProgress(id, name, e.loaded, e.total));
        }, xhr.onreadystatechange = function() {
            4 == xhr.readyState && self._onComplete(id, xhr);
        }, params = params || {}, params.qqfile = name;
        var queryString = qq.obj2url(params, this._options.action);
        xhr.open("POST", queryString, !0), xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest"), 
        xhr.setRequestHeader("X-File-Name", encodeURIComponent(name)), xhr.setRequestHeader("Content-Type", "application/octet-stream"), 
        xhr.send(file);
    },
    _onComplete: function(id, xhr) {
        if (this._files[id]) {
            var name = this.getName(id), size = this.getSize(id);
            if (this._options.onProgress(id, name, size, size), 200 == xhr.status) {
                this.log("xhr - server response received"), this.log("responseText = " + xhr.responseText);
                var response;
                try {
                    response = eval("(" + xhr.responseText + ")");
                } catch (err) {
                    response = {};
                }
                this._options.onComplete(id, name, response);
            } else this._options.onComplete(id, name, {});
            this._files[id] = null, this._xhrs[id] = null, this._dequeue(id);
        }
    },
    _cancel: function(id) {
        this._options.onCancel(id, this.getName(id)), this._files[id] = null, this._xhrs[id] && (this._xhrs[id].abort(), 
        this._xhrs[id] = null);
    }
});