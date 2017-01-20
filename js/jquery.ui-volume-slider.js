/**
 * jQuery UI Volume Slider control
 * @author Denis Izmaylov <izmaylov.dm@gmail.com>
 * @date 2013-09-01
 *
 * Usage:
 * 1. Create:
 *    $(elem).UIVolumeSlider({
 *      min: 0,
 *      max: 99,
 *      value: 50,
 *      smooth: false
 *    });
 *
 * 2. Read:
 *    $(elem).UIVolumeSlider('value');
 *    // => 50
 *
 *    $(elem).UIVolumeSlider('max');
 *    // => 99
 *
 * 3. Update:
 *    $(elem).UIVolumeSlider('value', 3);
 *    $(elem).UIVolumeSlider({min: 1, max: 10});
 *
 * 4. Destroy:
 *    $(elem).UIVolumeSlider('destroy');
 *
 * 5. Events:
 *    $(elem).on('thumbmove', function (value) { ... }); // when slider thumb is moving
 *    $(elem).on('change', function (value) { ... } ); // when user changes are complete
 */

;(function (factory) {

    'use strict';

    if (typeof define === 'function' && define.amd) {

        // AMD. Register as an anonymous module
        define(['jquery', 'jquery.ui-slider'], factory);

    } else if (typeof exports === 'object') {

        // NodeJS / CommonJS
        factory(require('jquery'), require('jquery.ui-slider'));

    } else {

        // Browser globals
        factory(jQuery);
    }

})(function ($) {

    'use strict';

    var
        /**
         * Default component options,
         * you can override it via component constructor
         * @type {Object}
         */
        defaultOptions = {

            min: 0,
            max: 99,
            value: 0,
            smooth: true,
            seekOnTrack: true,
            seekOnOwner: true,
            vertical: false, // true - to use vertical orientation

            createElements: true

        }, // defaultOptions {...}


        /** @type {String} */
        basicTemplate =
            '<div class="ui-slider-track">' +
                '<div class="ui-slider-thumb">' +
                    '<div></div>' +
                '</div>' +
            '</div>',



        /** @type {ComponentInstance[]} */
        componentInstances = [],


        ComponentPrototype = {

            /**
             * Create DOM elements, attach event handlers, etc
             * @param {Object} options
             */
            create: function (options) {

                this._onOwnerMouseDown = this.onOwnerMouseDown.bind(this);
                this._onThumbMouseDown = this.onThumbMouseDown.bind(this);
                this._onWindowMouseMove = this.onWindowMouseMove.bind(this);
                this._onWindowMouseUp = this.onWindowMouseUp.bind(this);


                /**
                 * Create and bind DOM element
                 */
                if (options.createElements) {

                    this.owner.append(basicTemplate);
                }

                this.owner
                    .addClass('ui-slider-control')
                    .addClass(options.vertical ? 'vertical' : 'horizontal');


                this.trackObj = this.owner.find('.ui-slider-track');
                this.thumbObj = this.owner.find('.ui-slider-thumb');


                /**
                 * Bind event handlers
                 */
                this.thumbObj.on('mousedown touchstart', this._onThumbMouseDown);
                this.owner.on('mousedown touchstart', this._onOwnerMouseDown);



                /**
                 * Assign specified options
                 */
                this.update(options);

            }, // create()


            /**
             * Disable edit mode, detach event handlers
             */
            destroy: function () {

                this.owner.off('mousedown touchstart', this._onOwnerMouseDown);
                this.thumbObj.off('mousedown touchstart', this._onThumbMouseDown);

                this.setEditMode(false);

            }, // destroy()


            /**
             * Calls when the user tries to update component options
             * @param {Object} options
             */
            update: function (options) {

                for (var key in options) {
                    if (!options.hasOwnProperty(key)) continue;

                    this.setOption(key, options[key]);
                }

            }, // update()


            /**
             * @param {String} name
             * @param {*} value
             * @todo we can extract DOM operations to external method
             */
            setOption: function (name, value) {

                var previousValue = this.options[name];

                this.options[name] = value;


                switch (name) {

                    case 'value':

                        this.owner.trigger('change', [this.options.value, previousValue]);

                    // now we will fall to the next block:

                    case 'min':
                    case 'max':

                        var position =
                            this.options.value * 100 /
                            (this.options.max - this.options.min);

                        if (this.options.vertical) {

                            position = 100 - position;

                            this.thumbObj.css('top', position + '%');

                        } else {

                            this.thumbObj.css('left', position + '%');
                        }


                        break;

                } // switch (...)

            }, // setOption()


            /**
             * @param {String} name
             * @returns {*}
             */
            getOption: function (name) {

                var result = this.options[name];

                if (name === 'value') {

                    result = this._startedValue || result;
                }

                return result;

            }, // getOption()


            /*
             * Snippet:
             * Repairs jquery event object to support iPhone and iPad events
             * @param {Object} [event] jQuery event
             */
            prepareJQueryTouchEvent: function (event) {

                var original_event = event.originalEvent || event;

                if (original_event.targetTouches && original_event.targetTouches[0]) {
                    event.pageX = original_event.targetTouches[0].pageX;
                    event.pageY = original_event.targetTouches[0].pageY;
                }
                if (typeof original_event.preventDefault == 'function'
                    && typeof event.stopPropagation != 'function') {
                    event.stopPropagation = original_event.preventDefault.bind(original_event);
                }

            },// prepareJQueryTouchEvent()


            /**
             * Handles custom actions (except 'create', 'update', 'destroy')
             * @param {String} action
             * @param {Array} params
             * @returns {*}
             */
            handleAction: function (action, params) {

                /**
                 * Is it options key?
                 * In this case we:
                 * a) detect which is requested operation - get or set value?
                 * b) process the operation.
                 */
                if (typeof this.options[action] !== 'undefined') {

                    if (arguments.length === 1) { // get value

                        var result = this.options[action];

                        switch (action) {

                            case 'value':
                                result = this._startedValue || result;
                                break;

                        }

                        return result;

                    } else { // set value

                        this.options[action] = params[0];

                        switch (action) {

                            case 'value':

                                this.owner.trigger('change', [this.options.value]);

                            // now we will fall to the next block:

                            case 'min':
                            case 'max':

                                var position =
                                    this.options.value * 100 /
                                    (this.options.max - this.options.min);

                                if (this.options.vertical) {

                                    position = 100 - position;

                                    this.thumbObj.css('top', position + '%');

                                } else {

                                    this.thumbObj.css('left', position + '%');
                                }


                                break;

                        } // switch (...)
                    }
                }

            }, // handleAction()



            /**
             * CUSTOM COMPONENT METHODS
             */

            /**
             * @param {Boolean} value
             * @private
             */
            setEditMode: function (value) {

                if (value) {

                    this.owner.addClass('editing');

                    $(window)
                        .on('mousemove touchmove', this._onWindowMouseMove)
                        .on('mouseup touchend', this._onWindowMouseUp);

                } else {

                    delete this._startedValue;

                    this.owner
                        .removeClass('editing')
                        .trigger('change', [this.options.value]);

                    $(window)
                        .off('mousemove touchmove', this._onWindowMouseMove)
                        .off('mouseup touchend', this._onWindowMouseUp);
                }

            }, // setEditMode()


            /**
             * @param {Number} position
             * @param {Number} trackLength
             * @private
             */
            setThumbPosition: function (position, trackLength) {

                var thumbPosition = Math.max(0, Math.min(position, trackLength));

                /**
                 * Calculate new <this.options.value>
                 */
                if (this.options.vertical) {

                    this.options.value =
                        (1 - thumbPosition / trackLength) *
                        (this.options.max - this.options.min);

                } else {

                    this.options.value =
                        (thumbPosition / trackLength) *
                        (this.options.max - this.options.min);
                }


                /**
                 * Extended behaviors (value validation)
                 */
                if (!this.options.smooth) {

                    this.options.value = Math.round(this.options.value);

                    if (this.options.vertical) {

                        thumbPosition =
                            trackLength -
                            this.options.value * trackLength /
                            (this.options.max - this.options.min);

                    } else {

                        thumbPosition =
                            this.options.value * trackLength /
                            (this.options.max - this.options.min);
                    }
                }


                /**
                 * Update UI, send triggers, etc
                 */
                if (this.options.vertical) {

                    this.thumbObj.css('top', (100 * thumbPosition / trackLength) + '%');

                } else {

                    this.thumbObj.css('left', (100 * thumbPosition / trackLength) + '%');
                }


                this.owner.trigger('thumbmove', [this.options.value]);

            }, // setThumbPosition()


            /**
             * @param {Object} event
             * @private
             */
            onOwnerMouseDown: function (event) {

                var offsetX, offsetY;


                if (this.options.seekOnOwner && $(event.target).is(this.owner)) {

                    var ownerOffset = this.owner.offset(),
                        trackOffset = this.trackObj.offset();

                    offsetX = event.offsetX - (trackOffset.left - ownerOffset.left);
                    offsetY = event.offsetY - (trackOffset.top - ownerOffset.top);

                } else if (this.options.seekOnTrack && $(event.target).is(this.trackObj)) {

                    offsetX = event.offsetX;
                    offsetY = event.offsetY;
                }


                if (typeof offsetX !== 'undefined') { // it means we have both offsets and should handle it

                    if (this.options.vertical) {

                        this.setThumbPosition(offsetY, this.trackObj.height());

                    } else {

                        this.setThumbPosition(offsetX, this.trackObj.width());
                    }


                    this.owner.trigger('change', [this.options.value]);

                    event.preventDefault();
                }

            }, // onOwnerMouseDown()


            /**
             * @param {Object} event
             * @private
             */
            onThumbMouseDown: function (event) {

                this.prepareJQueryTouchEvent(event);


                this._startedValue = this.options.value;

                if (this.options.vertical) {

                    this._startedThumbDeltaY = event.pageY - parseInt(this.thumbObj.css('top'), 10);

                    this._startedTrackPageY = event.pageY - parseInt(this.thumbObj.css('top'), 10);
                    this._startedTrackHeight = this.trackObj.height();

                } else {

                    this._startedThumbDeltaX = event.pageX - parseInt(this.thumbObj.css('left'), 10);

                    this._startedTrackPageX = event.pageX - parseInt(this.thumbObj.css('left'), 10);
                    this._startedTrackWidth = this.trackObj.width();
                }


                this.setEditMode(true);

                event.preventDefault();
                event.stopPropagation();

            }, // onThumbMouseDown()


            /**
             * @param {Object} event
             * @private
             */
            onWindowMouseMove: function (event) {

                /**
                 * Calculate position and value
                 */
                var position;

                this.prepareJQueryTouchEvent(event);


                if (this.options.vertical && event.pageY >= this._startedTrackPageY) {

                    position = Math.min(
                            event.pageY - this._startedThumbDeltaY,
                        this._startedTrackHeight
                    );

                    this.setThumbPosition(position, this._startedTrackHeight);


                } else if (!this.options.vertical && event.pageX >= this._startedTrackPageX) {

                    position = Math.min(
                            event.pageX - this._startedThumbDeltaX,
                        this._startedTrackWidth
                    );

                    this.setThumbPosition(position, this._startedTrackWidth);
                }

            }, // onWindowMouseMove()


            /**
             * @param {Object} event
             */
            onWindowMouseUp: function (event) {

                this.prepareJQueryTouchEvent(event);

                this.setEditMode(false);

                event.preventDefault();
                event.stopPropagation();

            } // onWindowMouseUp()

        }, // ComponentPrototype {...}



        /**
         * Component instance constructor,
         * will be placed at <componentInstances>
         * @param {jQuery} [owner]
         * @param {Object} [options]
         * @constructor
         */
        ComponentInstance = function (owner, options) {

            /** @type {jQuery} */
            this.owner = owner;

            /** @type {Object} */
            this.options = {};


            this.create(
                $.extend({}, defaultOptions, options)
            );

        }; // ComponentInstance()


    $.extend(ComponentInstance.prototype, ComponentPrototype);



    /**
     * jQuery Plugin Interface layer
     * @param {String|Object} [param] action name (i.e. 'destroy') or params to update
     * @this {jQuery}
     */
    $.fn.UISlider = function (param) {

        var result,
            action = (typeof param === 'string') ? param : 'create',
            options = (typeof param === 'object') ? param : arguments[1];


        // Process each element
        this.each(function () {

            var $this = $(this);

            /**
             * Try to find a component instance for this element,
             * also update <action> in successful ('create' --> 'update')
             */
            var currentInstance,
                currentIndex;

            for (var index = 0, length = componentInstances.length;
                index < length; index++) {

                if (componentInstances[index].owner.is($this)) {

                    currentInstance = componentInstances[index];
                    currentIndex    = index;

                    if (action === 'create') {

                        action = 'update';
                    }

                    break;
                }
            }



            /**
             * Process basic actions ('create', 'update', 'destroy')
             */
            switch (action) {

                case 'create':

                    currentInstance = new ComponentInstance(
                        $this,
                        $.extend({}, options) // copy defaults options and override it by specified
                    );

                    componentInstances.push(currentInstance);

                    break;



                case 'update':

                    if (currentInstance) {

                        currentInstance.update(options);
                    }

                    break;



                case 'destroy':

                    if (currentIndex) {

                        currentInstance.destroy();

                        componentInstances.splice(currentIndex, 1);
                    }

                    break;



                default:

                    if (currentInstance) {

                        if (typeof currentInstance[action] === 'function') {

                            result = currentInstance[action](options);

                        } else {

                            result = currentInstance.options[action];

                            if (typeof options !== 'undefined') {

                                currentInstance.setOption(action, options);
                            }
                        }
                    }

                    break;

            } // switch (action)

        });


        return (typeof result !== 'undefined') ? result : this;

    }; // $.fn.UISlider()

});