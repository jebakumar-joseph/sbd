var FLCFCommon = {
    fields: {},
    units: {},
    field_defs: {},
    field_options: {},
    field_unit_names: {},
    unit_groups: {},
    templates: {},
    next_num: {},
    group_labels: {},
    delete_labels: {},
    preview_buf: {},
    callbacks: {},
    oldGroupNo: null,

    addGroup: function() {
        var btn_elm = jQuery(this);
        var p_elm = btn_elm.parent();
        var div_elm = p_elm.siblings('div.flcf');
        var field_name = btn_elm.prop('id').match(/(.*?)_add_button/)[1];
        var unit_name;
        if (FLCFCommon.units[field_name]) {
            var sel_elm = p_elm.children('select.flcf-select-unit');
            unit_name = sel_elm.val();
        }
        FLCFCommon.addGroupSub(field_name, unit_name, div_elm);
    },

    addUnitGroup: function() {
        var btn_elm = jQuery(this);
        var p_elm = btn_elm.parent();
        var div_elm = p_elm.siblings('div.flcf');
        var field_name = btn_elm.prop('id').match(/(.*?)_add_group_button/)[1];
        var sel_elm = p_elm.children('select.flcf-select-unit-group');
        var group_name = sel_elm.val();
        var units = FLCFCommon.unit_groups[field_name][group_name].units;
        for (var i = 0; i < units.length; i++) {
            FLCFCommon.addGroupSub(field_name, units[i], div_elm);
        }
        jQuery(div_elm).trigger('flcf_add_unit_group', group_name);
    },

    changeUnitGroup: function() {
        if (confirm(trans('If you change unit group, all data in this customfield will be lost.') + String.fromCharCode(13) + trans('Are you ok ?'))) {
            var btn_elm = jQuery(this);
            var p_elm = btn_elm.parent();
            var div_elm = p_elm.siblings('div.flcf');
            var field_name = btn_elm.prop('id').match(/(.*?)_change_group_button/)[1];
            var sel_elm = p_elm.children('select.flcf-select-unit-group');
            var group_name = sel_elm.val();
            var units = FLCFCommon.unit_groups[field_name][group_name].units;
            if (FLCFCommon.field_options[field_name].tab) {
                div_elm.tabs('disable');
            }
            div_elm.html('');
            for (var i = 0; i < units.length; i++) {
                FLCFCommon.addGroupSub(field_name, units[i], div_elm);
            }
            if (FLCFCommon.field_options[field_name].tab) {
                div_elm.tabs('destroy');
                FLCFCommon.setupTab(field_name);
            }
            jQuery(div_elm).trigger('flcf_change_unit_group', group_name);
        }

    },

    addGroupSub: function(field_name, unit_name, div_elm) {
        var tmpl;

        if (FLCFCommon.units[field_name]) {
            tmpl = FLCFCommon.templates[field_name][unit_name];
        }
        else {
            tmpl = FLCFCommon.templates[field_name];
        }
        var next_num = FLCFCommon.next_num[field_name];
        tmpl = tmpl.replace(/_flcfg0/g, '_flcfg' + next_num);
        FLCFCommon.next_num[field_name]++;
        div_elm.append(tmpl);
        var tmpl_div = jQuery('#' + field_name + '_flcfg' + next_num);
        var sel_a_list = tmpl_div.find('a.mt-modal-open');
        if (sel_a_list.length) {
            jQuery.each(sel_a_list, function() {
                var sel_a = jQuery(this);
                var sel_href = sel_a.prop('href');
                sel_href = sel_href.replace(/_flcfg(\d+)/, '_flcfg' + next_num);
                sel_a.prop({ href: sel_href });
                sel_a.mtModal();
                sel_a.on('click', function() {
                    jQuery('.flcfex-color').colorpicker('hidePalette');
                    jQuery('.color-picker').hide();
                });
            });
        };
        /* set calendar */
        FLCFCommon.setCalendar(tmpl_div);
        /* set tabs and accordions on block */
        FLCFCommon.setTabsAndAccordions(tmpl_div);
        /* set unit name */
        if (FLCFCommon.units[field_name]) {
            tmpl_div.children('div.flcf-field-header').children('select.flcf-change-unit')
                .val(unit_name)
                .on('change', FLCFCommon.changeUnit);
            jQuery('#' + field_name + '_flcfg' + next_num + '_flcf_unit_name_').val(unit_name);
        }
        FLCFCommon.renewValue(field_name);
        /* add tab */
        if (FLCFCommon.tabs[field_name]) {
            var ul = div_elm.find('ul.ui-tabs-nav');
            var label = tmpl_div.find('span.flcf-field-label');
            var li = '<li><a href="#' + tmpl_div.prop('id') + '">' + label.text() + '</a></li>';
            label.hide();
            ul.append(li);
            div_elm.tabs('refresh');
            div_elm.tabs('option', 'active', ul.find('li').length - 1);
        }
        /* add accordion */
        else if (FLCFCommon.accordions[field_name]) {
            var acc_length = div_elm.find('.flcf-block').length;
            var acc = jQuery('#' + field_name + '_flcfg');
            acc.accordion('refresh');
            acc.accordion('option', 'active', acc_length - 1);
        }
        // call post_add callback
        FLCFCommon.post_add_callback(field_name, next_num);
        // fireflcf_add  event
        tmpl_div.trigger('flcf_add', unit_name);
    },

    post_add_callback: function(cf_name, group_no) {
        var field_def = FLCFCommon.field_defs[cf_name];
        jQuery.each(field_def, function(f_name, f_def) {
            var flcf_type = f_def.type;
            var cb = FLCFCommon.callbacks[flcf_type];
            if (cb && cb.post_add) {
                var field_name = cf_name + '_flcfg' + group_no + '_' + f_name + '_';
                cb.post_add(cf_name, group_no, f_name);
                if (FLCFCommon.js_set_values[flcf_type]) {
                    cb.set_value(cf_name, group_no, f_name, jQuery('#' + field_name).val());
                }
            }
        });
    },

    changeUnit: function() {
        var sel_elm, unit_div_elm, group_name, cf_name, group_no, unit_name, old_unit_name, cbs;
        var t = jQuery(this);
        var nodeName = t.get()[0].nodeName.toLowerCase();
        if (nodeName == 'select') {
            sel_elm = t;
            unit_div_elm = sel_elm.parent().parent();
            unit_name = sel_elm.val();
        }
        else if (nodeName == 'div') {
            unit_div_elm = t;
            sel_elm = t.find('.flcf-field-header select');
            if (!sel_elm.length) {
                sel_elm = [];
            }
        }
        unit_name = sel_elm.length ? sel_elm.val() : '';
        group_name = unit_div_elm.prop('id');
        matches = group_name.match(/(.*?)_flcfg(\d+)/);
        cf_name = matches[1];
        group_no = matches[2];
        var save_buf = {};
        var height_buf = {};
        var height_restore_methods = [];
        var ctl_mode = {};
        FLCFCommon.preview_buf = {};
        jQuery.each(FLCFCommon.field_defs[cf_name], function(f_name, f_def) {
            var form_f_name = group_name + '_' + f_name + '_';
            if (f_name != 'flcf_unit_name') {
                save_buf[f_name] = FLCFCommon.getFieldValue(f_def, form_f_name);
                cbs = FLCFCommon.callbacks[f_def.type];
                if (cbs && cbs.get_mode && (unit_name == '' || FLCFCommon.used_ctrls[cf_name][unit_name][f_name])) {
                    ctl_mode[f_name] = cbs.get_mode(cf_name, group_no, f_name);
                }
                if (cbs && cbs.save_height && (unit_name == '' || FLCFCommon.used_ctrls[cf_name][unit_name][f_name])) {
                    height_buf[f_name] = cbs.save_height(cf_name, group_no, f_name);
                }
                if (FLCFCommon.asset_types[f_def.type]) {
                    if (typeof FLCFCommon.preview_buf[cf_name] == 'undefined') {
                        FLCFCommon.preview_buf[cf_name] = {};
                    }
                    if (jQuery('#' + form_f_name + '_preview').length) {
                        FLCFCommon.preview_buf[cf_name][f_name] = jQuery('#' + form_f_name + '_preview').html();
                    }
                }
            }
            else {
                old_unit_name = FLCFCommon.getFieldValue(f_def, form_f_name);
            }
        });
        var old_tmpl_div = jQuery('#' + cf_name + '_flcfg' + group_no);
        if (unit_name && unit_name != old_unit_name) {
            old_tmpl_div.trigger('flcf_before_change_unit', [ unit_name, old_unit_name]);
        }
        var next_num = FLCFCommon.next_num[cf_name];
        var tmpl;
        if (unit_name) {
            tmpl = FLCFCommon.templates[cf_name][unit_name];
        }
        else {
            tmpl = FLCFCommon.templates[cf_name];
        }
        tmpl = tmpl.replace(/_flcfg0/g, '_flcfg' + next_num);
        FLCFCommon.next_num[cf_name]++;
        unit_div_elm.after(tmpl);
        // pre_remove callback
        FLCFCommon.pre_remove_callback(cf_name, group_no);
        unit_div_elm.remove();
        var tmpl_div = jQuery('#' + cf_name + '_flcfg' + next_num);
        FLCFCommon.setCalendar(tmpl_div);
        // call post_add callback
        FLCFCommon.oldGroupNo = {};
        FLCFCommon.oldGroupNo[next_num] = group_no;
        FLCFCommon.post_add_callback(cf_name, next_num);
        delete FLCFCommon.oldGroupNo;
        
/*
        var sel_a_list = tmpl_div.find('a.mt-open-dialog');
        if (sel_a_list.length) {
            jQuery.each(sel_a_list, function() {
                var sel_a = jQuery(this);
                var sel_href = sel_a.prop('href');
                sel_href = sel_href.replace(/_flcfg(\d+)/, '_flcfg' + next_num);
                sel_a.prop({ href: sel_href });
                sel_a.mtDialog();
            });
        };
*/
        var sel_a_list = tmpl_div.find('a.mt-modal-open');
        if (sel_a_list.length) {
            jQuery.each(sel_a_list, function() {
                var sel_a = jQuery(this);
                var sel_href = sel_a.prop('href');
                sel_href = sel_href.replace(/_flcfg(\d+)/, '_flcfg' + next_num);
                sel_a.prop({ href: sel_href });
                sel_a.mtModal();
            });
        };
        var delay_time = 0;
        jQuery.each(FLCFCommon.field_defs[cf_name], function(f_name, f_def) {
            var form_f_name = cf_name + '_flcfg' + next_num + '_' + f_name + '_';
            if (f_name != 'flcf_unit_name') {
                cbs = FLCFCommon.callbacks[f_def.type];
                if (cbs && cbs.set_value) {
                    cbs.set_value(cf_name, next_num, f_name, save_buf[f_name]);
                }
                else if (f_def.type == 'checkbox') {
                    jQuery('#' + form_f_name).prop({'checked': save_buf[f_name]});
                }
                else if (f_def.type == 'datetime' || f_def.type == 'date' || f_def.type == 'time') {
                    var ymd, hms;
                    FLCFCommon.setDateTime(f_def.type, form_f_name, save_buf[f_name]);
                    jQuery('#' + form_f_name).val(save_buf[f_name]);
                }
                else if (f_def.type == 'radio') {
                    var radios = jQuery('input[name="' + form_f_name + '"]');
                    for (var i = 0, j = radios.length; i < j; i++) {
                        var radio = jQuery(radios[i]);
                        if (radio.val() == save_buf[f_name]) {
                            radio.prop('checked', true);
                        }
                    }
                }
                else {
                    jQuery('#' + form_f_name).val(save_buf[f_name]);
                }
                if (cbs && cbs.set_mode && (unit_name == '' || FLCFCommon.used_ctrls[cf_name][unit_name][f_name])) {
                    cbs.set_mode(cf_name, next_num, f_name,ctl_mode[f_name], delay_time);
                    delay_time += 10;
                }
                if (cbs && cbs.restore_height && (unit_name == '' || FLCFCommon.used_ctrls[cf_name][unit_name][f_name])) {
                     height_restore_methods.push({
                         func: cbs.restore_height,
                         cf_name: cf_name,
                         group_no: next_num,
                         f_name: f_name,
                         height: height_buf[f_name]
                     })
//                     cb.restore_height(cf_name, next_num, f_name, height_buf[f_name]);
                }
                if (FLCFCommon.asset_types[f_def.type]) {
                    var p_html = FLCFCommon.preview_buf[cf_name][f_name];
                    if (typeof p_html == 'undefined') {
                        p_html = '';
                    }
                    else {
                        p_html = p_html.trim();
                    }
                    var p_div = jQuery('#' + form_f_name + '_preview');
                    p_div.html(p_html);
                    if (p_html.length) {
                        jQuery('#' + form_f_name + '_remove_asset').removeClass('hidden');
                    }
                }
                // set required mark to label
                var lbl_elm = jQuery('#' + form_f_name).parent().find('label[for="' + form_f_name + '"]');
                if (
                    (
                        f_def.required ||
                        (unit_name && FLCFCommon.unit_defs[cf_name][unit_name].required[f_name])
                    )
                    &&
                    !lbl_elm.hasClass('flcf-required')
                ) {
                    lbl_elm.addClass('flcf-required');
                }
                else if (
                    (
                        !f_def.required &&
                        (unit_name && !FLCFCommon.unit_defs[cf_name][unit_name].required[f_name])
                    )
                    &&
                    lbl_elm.hasClass('flcf-required')
                ) {
                    lbl_elm.removeClass('flcf-required');
                }
            }
        });
        if (unit_name) {
            jQuery('#' + cf_name + '_flcfg' + next_num).find('.flcf-change-unit')
                .val(unit_name)
                .on('change', FLCFCommon.changeUnit);
            jQuery('#' + cf_name + '_flcfg' + next_num + '_flcf_unit_name_').val(unit_name);
        }
        FLCFCommon.renewValue(cf_name);
        // refresh tab
        if (FLCFCommon.field_options[cf_name].tab) {
            var tabs = tmpl_div.parent();
            var active = tabs.tabs('option', 'active');
            var ul = tmpl_div.siblings('ul.ui-tabs-nav');
            var li = jQuery(ul.children('li')[active]);
            li.children('a').attr('href', '#' + tmpl_div.prop('id'));
            tmpl_div.find('.flcf-field-header .flcf-field-label').hide();
//            tabs.tabs('refresh');
//            tabs.tabs('destroy');
            var m = tabs.prop('id').match(/^((?:customfield_|content-field-).*?)_flcfg$/);
            var cf_name = m[1];
            tmpl_div.parent().tabs('destroy');
            FLCFCommon.setupTab(cf_name, 'refresh', active);
        }
        // refresh accordion
        else if (FLCFCommon.field_options[cf_name].accordion) {
            var acc = tmpl_div.parent();
            var active = acc.accordion('option', 'active');
            acc.accordion('refresh');
            acc.accordion('option', 'active', active);
        }
        // restore heights
        jQuery.each(height_restore_methods, function(idx, meth) {
            meth.func(meth.cf_name, meth.group_no, meth.f_name, meth.height);
        });
        // fire flcf_add
        tmpl_div.trigger('flcf_add', unit_name);
        if (unit_name && unit_name != old_unit_name) {
            tmpl_div.trigger('flcf_change_unit', [ unit_name, old_unit_name ]);
        }
        return tmpl_div;
    },

    renewValue: function(field_name) {
        var fields;
        if (FLCFCommon.cf_type == 'customfield')  {
            fields = jQuery('#' + field_name + '-field div.flcf div.flcf-block');
        }
        else if (FLCFCommon.cf_type == 'contentfield') {
            fields = jQuery('#'  + field_name + '_flcfg div.flcf-block');
        }
        var field_order = [];
        var count = fields.length;
        for (var i = 0; i < count; i++) {
            var field = jQuery(fields[i]);
            var field_no = field.prop('id').match(/_flcfg(\d+)/)[1];
            // set field class
            field.removeClass('first-child');
            field.removeClass('last-child');
            if (i == 0) {
                field.addClass('first-child');
            }
            if (i == count - 1) {
                field.addClass('last-child');
            }
            field_order.push(field_no);
            // set field label
            var label_elm = field.children('div.flcf-field-header').children('span.flcf-field-label');
            var label_tmpl = FLCFCommon.group_labels[field_name];
            label_tmpl = label_tmpl.replace(/{{number}}/, i + 1);
            label_elm.html(label_tmpl);
            // delete remove button
            field.find('span.flcf-delete-button').remove();
            // add remove button
            if (count > 1 && !FLCFCommon.field_options[field_name].fixed) {
                var delete_tmpl = FLCFCommon.delete_labels[field_name];
                delete_tmpl = delete_tmpl.replace(/{{number}}/, i + 1);
                field.children('div.flcf-field-header').append('<span class="flcf-delete-button"><button type="button">' + delete_tmpl + '</span>')
                var delete_button = jQuery(field.find('span.flcf-delete-button button'));
                delete_button.on('click', FLCFCommon.removeGroup);
            }
            if (FLCFCommon.field_options[field_name].unit_label) {
                var unit_sel = field.find('select.flcf-change-unit');
                FLCFCommon.setUnitLabel(field_name, field_no, unit_sel);
            }
        }
        /* close field when all closed */
        if (FLCFCommon.cf_type == 'customfield') {
            if (FLCFCommon.normals[field_name] &&
                jQuery('#' + field_name + '-field .field-header button').text() == trans('Open all fields')) {
                jQuery('#' + field_name + '-field .flcf-field-content').hide();
            }
        }
        else if (FLCFCommon.cf_type == 'contentfield') {
            if (FLCFCommon.normals[field_name] &&
                jQuery('#' + field_name + '_flcfg').parent().find('label .button').text() == trans('Open all fields')) {
                jQuery('#' + field_name + '_flcfg .flcf-field-content').hide();
            }
        }
        jQuery('#' + field_name + '_order').val(fields.length + '|' + field_order.join(','));
    },

    removeGroup: function() {
        var btn_elm = jQuery(this);
        var block_elm = jQuery(this).closest('div.flcf-block');
        var lbl = block_elm.find('.flcf-field-label').text();
        if (confirm(trans('Delete [_1] ?', lbl))) {
            var cf_elm, field_name;
            if (FLCFCommon.cf_type == 'customfield') {
                if (MT.App.objectType) {
                    cf_elm = block_elm.closest('.field').find('div.last-child');
                }
                else {
                    cf_elm = block_elm.closest('.field');
                }
                field_name = jQuery(cf_elm.children('input[type="hidden"]')[0]).prop('name');
            }
            else if (FLCFCommon.cf_type == 'contentfield') {
                cf_elm = block_elm.closest('.form-group');
                field_name = cf_elm.children('input.flcf_content_field_values').prop('name');
            }
            var block_id = block_elm.prop('id');
            var rm_info = block_id.match(/((?:customfield_|content-field-).*?)_flcfg(\d+?)$/);
            FLCFCommon.pre_remove_callback(rm_info[1], rm_info[2]);
            var field_options = FLCFCommon.field_options[field_name];
            if (field_options.accordion) {
                var acc = block_elm.closest('.flcf.ui-accordion');
                var active = acc.accordion('option', 'active');
                var active_id = jQuery(acc.children('.flcf-block')[active]).prop('id');
                var delete_id = block_elm.prop('id');
            }
            block_elm.remove();
            if (field_options.tab) {
                var tab_wrapper = jQuery('#' + rm_info[1] + '_flcfg');
                tab_wrapper.tabs('refresh');
                var ul = tab_wrapper.children('ul.ui-tabs-nav');
                var tab_no = tab_wrapper.tabs('option', 'active');
                var lis = ul.children('li');
                jQuery(lis[tab_no]).remove();
                delete lis[tab_no];
            }
            FLCFCommon.renewValue(field_name);
            if (field_options && field_options.tab) {
                for (var i = tab_no; i < lis.length; i++) {
                    var li = jQuery(lis[i])
                    var b_id = li.attr('aria-controls');
                    var label = jQuery('#' + b_id + ' .flcf-field-header .flcf-field-label');
                    li.children('a').text(label.text());
                }
                tab_wrapper.tabs('refresh');
            }
            else if (FLCFCommon.field_options[field_name].accordion) {
                acc.accordion('refresh');
                if (active_id == delete_id) {
                    acc.accordion('option', 'active', active);
                }
                else {
                    var content = jQuery('#' + active_id).find('.flcf-field-content').get(0);
                    setTimeout(function() { FLCFCommon.accordionHeightCheck(content) }, 100);
                }
            }
        }
        else {
            return false;
        }
    },

    pre_remove_callback: function(cf_name, group_no) {
        jQuery.each(FLCFCommon.field_defs[cf_name], function(f_name, f_def) {
            cbs = FLCFCommon.callbacks[f_def.type];
            if (cbs && cbs.pre_remove) {
                cbs.pre_remove(cf_name, group_no, f_name);
            }
        });
    },

    setSortable : function(fields) {
        jQuery(fields).sortable({
            items: 'div.flcf-sort-enabled',
            placeholder: 'placeholder',
            distance: 3,
            opacity: 0.8,
            cursor: 'move',
            forcePlaceholderSize: true,
            handle: '.flcf-field-header',
            containment: 'parent',
            start: function(e, ui) {
//                console.log('drag start');
            },
            stop: function (e, ui) {
//                console.log('drag end');
                var div = ui.item[0];
                FLCFCommon.changeUnit.apply(div);
            }
        });
    },

    setFloat: function(fields) {
        jQuery(fields).sortable({
            items: 'div.flcf-sort-enabled',
            distance: 3,
            opacity: 0.8,
            cursor: 'move',
            handle: '.flcf-field-header',
            containment: 'parent',
            stop: function (e, ui) {
                var div = ui.item[0];
                FLCFCommon.changeUnit.apply(div);
            }
        });
    },

    initFields: function() {
        setTimeout(function() {
            /* init fields and set values */
            var fields;
            if (FLCFCommon.cf_type == 'customfield') {
                fields = jQuery('.field');
            }
            else if (FLCFCommon.cf_type == 'contentfield') {
                fields = jQuery('.mt-mainContent div.form-group');
            }
            jQuery.each(fields, function() {
                var cf_field = jQuery(this);
                var cf_bname;
                if (FLCFCommon.cf_type == 'customfield') {
                    var cf_id = cf_field.prop('id');
                    var cf_m = cf_id.match(/^(customfield_.*?)-field$/);
                    if (cf_m) {
                        cf_bname = cf_m[1];
                    }
                }
                else if (FLCFCommon.cf_type == 'contentfield') {
                    var inp = cf_field.children('input.flcf_content_field_values');
                    cf_bname = inp.prop('id');
                }
                if (FLCFCommon.field_defs[cf_bname]) {
                    var value = jQuery('#' + cf_bname).val();
                    value = jQuery.parseJSON(value);
                    jQuery.each(cf_field.find('.flcf-block'), function() {
                        var d = jQuery(this);
                        var id = d.prop('id');
                        var matches = id.match(/^((?:customfield_|content-field-).*?)_flcfg(\d+)$/);
                        var cf_name = matches[1];
                        var group_no = matches[2];
                        var unit_name;
                        var unit_sel = d.find('select.flcf-change-unit');
                        if (unit_sel) {
                            unit_name = unit_sel.val();
                        }
                        FLCFCommon.post_add_callback(cf_name, group_no);
                        // set label
                        if (FLCFCommon.field_options[cf_name].unit_label) {
                            FLCFCommon.setUnitLabel(cf_name, group_no, unit_sel);
                        }
                        // set tabs and accordions
                        FLCFCommon.setTabsAndAccordions(d);
                        // js set value to field
                        jQuery.each(FLCFCommon.field_defs[cf_name], function(field_name, f_def) {
                            var f_type = FLCFCommon.field_defs[cf_name][field_name].type;
                            if (FLCFCommon.js_set_values[f_type]) {
                                FLCFCommon.callbacks[f_type].set_value(cf_name, group_no, field_name, value[group_no - 1][field_name]);
                            }
                        });
                        jQuery(this).trigger('flcf_add', unit_name);
                    });
                }
            });
            /* add open / close button to normal flcf */
            jQuery.each(FLCFCommon.normals, function(cf_name) {
                var hdr_div;
                var btn = jQuery('<button type="button">' + trans('Fold all fields') + '</button>');
                if (FLCFCommon.cf_type == 'customfield') {
                    hdr_div = jQuery('#' + cf_name + '-field .mt-flexBreak');
                    var btn_div = jQuery('<div class="col" style="text-align: right"></div>');
                    btn_div.append(btn);
                    hdr_div.before(btn_div);
                }
                else if (FLCFCommon.cf_type == 'contentfield') {
//                    hdr_div = jQuery('#' + cf_name + '_flcfg').parent().children('label');
                    btn.addClass('flcf-fold-button');
                    hdr_div = jQuery('#' + cf_name + '_flcfg');
                    hdr_div.before(btn);
                    hdr_div.parent().css('position', 'relative');
                }
                btn.on('click', function() {
                    var lbl = btn.html();
                    if (lbl == trans('Fold all fields')) {
                        if (FLCFCommon.cf_type == 'customfield') {
                            jQuery('#' + cf_name + '-field .flcf-field-content').hide();
                        }
                        else if (FLCFCommon.cf_type == 'contentfield') {
                            jQuery('#' + cf_name + '_flcfg .flcf-field-content').hide();
                        }
                        btn.html(trans('Open all fields'));
                    }
                    else {
                        if (FLCFCommon.cf_type == 'customfield') {
                            jQuery('#' + cf_name + '-field .flcf-field-content').show();
                        }
                        if (FLCFCommon.cf_type == 'contentfield') {
                            jQuery('#' + cf_name + '_flcfg .flcf-field-content').show();
                        }
                        btn.html(trans('Fold all fields'));
                    }
                });
            });
            /* set tab */
            jQuery.each(FLCFCommon.tabs, function(cf_name) {
                FLCFCommon.setupTab(cf_name);
            });
            /* set accordion */
            jQuery.each(FLCFCommon.accordions, function(cf_name) {
                var field_div = jQuery('#' + cf_name + '_flcfg');
                var blocks = field_div.children('div.flcf-block');
                field_div.siblings('p.flcf_add_button').addClass('flcf-add-button-margin');
                var acc = field_div.accordion({
                    header: '.flcf-field-header',
                    animate: false,
                    activate: function(e, ui) {
                        setTimeout(function() { FLCFCommon.accordionHeightCheck(ui.newPanel.get(0)) }, 100);
                    }
                });
                field_div.on('mousedown', 'select.flcf-change-unit', function(e) {
                    var active = field_div.accordion('option', 'active');
                    var active_div = jQuery(field_div.children('div.flcf-block')[active]);
                    var select_div = jQuery(this).closest('div.flcf-block');
                    if (active_div.prop('id') != select_div.prop('id')) {
                        e.preventDefault();
                    }
                });
                if (FLCFCommon.field_options[cf_name].sortable) {
                    var start_pos, end_pos, blocks, count, active;
                    field_div.sortable({
                        handle: '.flcf-field-header',
                        items: 'div.flcf-block',
                        containment: 'parent',
                        start: function(e, ui) {
                            var dragging = ui.item;
                            var m = ui.item.prop('id').match(/^(.*?_flcfg)\d+$/);
                            var parent_id = m[1];
                            var acc = jQuery('#' + parent_id);
                            active = acc.accordion('option', 'active');
                            blocks = acc.children('div.flcf-block');
                            count = blocks.length;
                            for (var i = 0; i < count; i++) {
                                var block = jQuery(blocks[i]);
                                if (block.prop('id') == dragging.prop('id')) {
                                    start_pos = i;
                                    break;
                                }
                            }
                        },
                        stop: function(e, ui) {
                            var dragged = ui.item;
                            var div = ui.item[0];
                            var m = dragged.prop('id').match(/^(.*?_flcfg)\d+$/);
                            var parent_id = m[1];
                            var acc = jQuery('#' + parent_id);
                            var new_div = FLCFCommon.changeUnit.apply(div);
                            acc.accordion('refresh');
                            blocks = acc.children('div.flcf-block');
                            for (var i = 0; i < count; i++) {
                                var block = jQuery(blocks[i]);
                                if (block.prop('id') == new_div.prop('id')) {
                                    end_pos = i;
                                    break;
                                }
                            }
                            if (start_pos != active && end_pos != active) {
                                setTimeout(function() {
                                    FLCFCommon.accordionHeightCheck(jQuery(blocks[active]).children('.flcf-field-content').get(0));
                                }, 100);
                            }
                            else if (start_pos == active) {
                                acc.accordion('option', 'active', end_pos);
                                setTimeout(function() {
                                    FLCFCommon.accordionHeightCheck(new_div.children('.flcf-field-content').get(0));
                                }, 100);
                            }
                            else if (end_pos == active) {
                                acc.accordion('option', 'active', end_pos + 1);
                            }
                        }
                    });
                }
                var first_content = jQuery(field_div.children('div.flcf-block')[0]).children('.flcf-field-content').get(0);;
                setTimeout(function() { FLCFCommon.accordionHeightCheck(first_content) }, 100);
            });
        }, 10);
    },

    setupTab: function(cf_name, mode, active) {
        var field_div = jQuery('#' + cf_name + '_flcfg');
        var tabs = field_div.find('div.flcf-block');
        var ul = jQuery('<ul>');
        for (var i = 0; i < tabs.length; i++) {
            var tab = jQuery(tabs[i]);
            var label = tab.find('span.flcf-field-label');
            var li = '<li><a href="#' + tab.prop('id') + '">' + label.text() + '</a></li>';
            label.hide();
            ul.append(li);
        }
        field_div.siblings('p.flcf_add_button').addClass('flcf-add-button-margin');
        if (mode == 'refresh') {
            field_div.children('ul').remove();
        }
        field_div.prepend(ul);
        var t = field_div.tabs();
        field_div.tabs('refresh');
        field_div.tabs('option', 'active', (mode == 'refresh') ? active : 0);
        if (FLCFCommon.field_options[cf_name].sortable) {
            t.find('ul.ui-tabs-nav').sortable({
                update: function(e, ui) {
                    var field_order = [];
                    var ul = ui.item.parent();
                    var lis = ul.find('li');
                    var cf_name = ul.parent().prop('id').replace(/_flcfg$/, '');
                    for (var i = 0; i < lis.length; i++) {
                        var li = jQuery(lis[i]);
                        var div_id = li.attr('aria-controls');
                        var div = jQuery('#' + div_id);
                        var m = div_id.match(/_flcfg(\d+)$/);
                        var group_no = m[1];
                        field_order.push(group_no);
                        if (FLCFCommon.field_options[cf_name].unit_label) {
                            sel_elm = div.find('div.flcf-field-header select');
                            unit_label = sel_elm.find('option:selected').text();
                            li.children('a').text(unit_label);
                            del_elm = div.find('div.flcf-field-header button');
                            del_elm.text(trans('Delete [_1]', unit_label));
                        }
                        else {
                            var label_tmpl = FLCFCommon.group_labels[cf_name];
                            label_tmpl = label_tmpl.replace(/{{number}}/, i + 1);
                            li.children('a').text(label_tmpl);
                            var delete_tmpl = FLCFCommon.delete_labels[cf_name];
                            delete_tmpl = delete_tmpl.replace(/{{number}}/, i + 1);
                            div.find('.flcf-field-header .flcf-delete-button button').text(delete_tmpl);
                        }
                    }
                    jQuery('#' + cf_name + '_order').val(field_order.length + '|' + field_order.join(','));
                }
            });
        }
    },

    setUnitLabel: function(cf_name, group_no, unit_sel) {
        var label_elm = jQuery('#' + cf_name + '_flcfg' + group_no + ' div.flcf-field-header span.flcf-field-label');
        var btn_elm = jQuery('#' + cf_name + '_flcfg' + group_no + ' div.flcf-field-header button');
        var unit_label = unit_sel.find('option:selected').text();
        label_elm.text(unit_label);
        var btn_label = trans('Delete [_1]', unit_label);
        btn_elm.text(btn_label);
    },

    accordionHeightCheck: function(content) {
        if (content.style.height == '') {
            return;
        }
        else {
            content.style.height = '';
            setTimeout(function() { FLCFCommon.accordionHeightCheck(content) }, 100);
        }
    },

    fieldsToJSON: function() {
        for (var cf_name in FLCFCommon.fields) {
            var field_value = [];
            var field_order_s = jQuery('#' + cf_name + '_order').val();
            var f_tmp = field_order_s.split('|');
            var field_count = f_tmp[0];
            var field_order = f_tmp[1].split(',');
            for (var i = 0; i < field_count; i++) {
                var g_value = {};
                for (var j = 0; j < FLCFCommon.fields[cf_name].length; j++) {
                    var f_name = FLCFCommon.fields[cf_name][j]
                    var field_name = cf_name + '_flcfg' + field_order[i] + '_' + f_name + '_';
                    var f_def = FLCFCommon.field_defs[cf_name][f_name];
                    g_value[f_name] = FLCFCommon.getFieldValue(f_def, field_name);
                }
                field_value.push(g_value);
            }
            jQuery('#' + cf_name).val(field_value.toJSON());
        }
    },

    setCalendar: function(field) {
        field.find('input.text-date').datepicker({
            dateFormat: 'yy-mm-dd',
            dayNamesMin: FLCFCommon.day_names,
            monthNames: ['- 01','- 02','- 03','- 04','- 05','- 06','- 07','- 08','- 09','- 10','- 11','- 12'],
            showMonthAfterYear: true,
            prevText: '&lt;',
            nextText: '&gt;',
            onClose: function(dateText, inst){
                var $this = jQuery(this);
                var ns = jQuery.data( this, 'mtValidator' );
                if ( !ns ) return true;
                $this.mtValid({ focus: false });
            }
        });
    },

    setTabsAndAccordions: function(tmpl_div) {
        /* set tabs */
        var tab_wrappers = tmpl_div.find('.flcf-tab-wrapper');
        if (tab_wrappers.length) {
            for (var i = 0; i < tab_wrappers.length; i++) {
                var tab_wrapper = jQuery(tab_wrappers[i]);
                var tab_names = tab_wrapper.find('ul.flcf-tab-names li');
                var tabs = tab_wrapper.find('div.flcf-tab-content');
                var id_base = tmpl_div.prop('id') + '_flcf_tab' + i;
                for (var j = 0; j < tab_names.length; j++) {
                    var tab_id = id_base + '_' + j;
                    var tab_name = jQuery(tab_names[j]);
                    var tn = tab_name.text();
                    var a = '<a href="#' + tab_id + '">' + tn + '</a>';
                    tab_name.html(a);
                    var tab = jQuery(tabs[j]);
                    tab.prop('id', tab_id);
                }
            }
            tab_wrapper.tabs();
        }
        /* set accordion */
        tmpl_div.find('.flcf-accordion-wrapper').accordion({ animate: false });
    },

    renewAccordionHeight: function(e, ui) {
        var div = jQuery(ui.item[0]);
        var m = div.prop('id').match(/(customfield.*?)-field$/);
        if (m && FLCFCommon.field_options[m[1]].accordion) {
            var cf_name = m[1];
            var acc = jQuery('#' + cf_name + '_flcfg');
            var active_no = acc.accordion('option', 'active');
            var active_div = jQuery(acc.find('div.flcf-block')[active_no]);
            setTimeout(function() {
                FLCFCommon.accordionHeightCheck(active_div.children('.flcf-field-content').get(0));
            }, 100);
        }
    },

    getFieldValue: function(f_def, field_name) {
        var cbs = FLCFCommon.callbacks;
        if (cbs[f_def.type] && cbs[f_def.type].get_value) {
            var matches = field_name.match(/^(.*?)_flcfg(\d+)_(.*?)_$/);
            return cbs[f_def.type].get_value(matches[1], matches[2], matches[3]);
        }
        else if (f_def.type == 'checkbox') {
            return jQuery('#' + field_name).prop('checked') ? 1 : 0;
        }
        else if (f_def.type == 'radio') {
            return jQuery('input[name="' + field_name + '"]:checked').val();
        }
        else if (f_def.type == 'datetime' || f_def.type == 'date' || f_def.type == 'time') {
            return FLCFCommon.getDateTime(f_def.type, field_name);
        }
        else {
            return jQuery('#' + field_name).val();
        }
    },

    setDateTime: function(type, field_name, value) {
        var dt;
        try {
            dt = jQuery.parseJSON(value);
        }
        catch(e) {
            dt = '';
        }
        if (dt == '') {
            ymd = '';
            hms = '';
        }
        else if (FLCFCommon.objtype(dt) == 'Object') {
            ymd = dt.date;
            hms = dt.time;
        }
        else {
            ymd = value.substr(0, 8);
            hms = value.substr(8);
            ymd = ymd.replace(/(\d{4})(\d{2})(\d{2})/, function(a, y, m, d) {
                return y +  '-' + m + '-' + d;
            });
            hms = hms.replace(/(\d{2})(\d{2})(\d{2})/, function(a, h, m, s) {
                return h + ':' + m + ':' + s;
            });
        }
        jQuery('#' + field_name + '_d').val(ymd);
        jQuery('#' + field_name + '_t').val(hms);
    },

    getDateTime: function(type, field_name) {
        if (jQuery('#' + field_name + '_d').length == 0) {
            return jQuery('#' + field_name).val();
        }
        var d, t;
        if (type == 'datetime') {
            d = jQuery('#' + field_name + '_d').val();
            t = jQuery('#' + field_name + '_t').val();
        }
        else if (type == 'date') {
            d = jQuery('#' + field_name + '_d').val();
            t = d ? '00:00:00' : '';
        }
        else if (type == 'time') {
            t = jQuery('#' + field_name + '_t').val();
            d = t ? '1970-01-01' : '';
        }
        if (!d  && !t) {
            return '';
        }
        var ymd = d.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
        var hms = t.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2})){0,1}$/);
        if (ymd != null && hms != null) {
            hms[3] = (hms[3] == undefined) ? 0 : hms[3];
            var c_date = new Date(ymd[1], ymd[2] - 1, ymd[3], hms[1], hms[2], hms[3], 0);
            // check invalid date
            var c_year   = c_date.getYear() + 1900;
            var c_month  = c_date.getMonth() + 1;
            var c_day    = c_date.getDate();
            var c_hour   = c_date.getHours();
            var c_minute = c_date.getMinutes();
            var c_second = c_date.getSeconds();
            if (c_year != ymd[1] || c_month != ymd[2] || c_day != ymd[3] ||
                c_hour != hms[1] || c_minute != hms[2] || c_second != hms[3]) {
                return jQuery.toJSON({ error: 1, date: d, time: t });
            }
            // convert to ts
            var fmt = function(v, l) {
                var f = '';
                for (var i = 0; i < l; i++) {
                    f = f + '0';
                }
                return (f + v).substr(-l, l);
            }
            var ts;
            if (FLCFCommon.objtype(ymd) == 'Array') {
                ts = fmt(ymd[1], 4) + fmt(ymd[2], 2) + fmt(ymd[3], 2);
            }
            else {
                ts = '19700101';
            }
            if (FLCFCommon.objtype(hms) == 'Array') {
                hms[3] = hms[3] ? hms[3] : 0;
                ts += fmt(hms[1], 2) + fmt(hms[2], 2) + fmt(hms[3], 2);
            }
            else {
                ts += '000000';
            }
            return ts;
        }
        else {
            return jQuery.toJSON({ error: 1, date: d, time: t });
        }
    },

    getFieldName: function(o) {
        var obj = jQuery(o);
        var id = obj.prop('id');
        id.match(/flcfg\d+_(.*)_$/);
        return RegExp.$1;
    },

    getBasename: function(o) {
        var obj = jQuery(o);
        var id = obj.prop('id');
        id.match(/customfield_(.*?)_flcfg/);
        return RegExp.$1;
    },

    getGroupNumber: function(o) {
        var obj = jQuery(o);
        var id = obj.prop('id');
        id.match(/_flcfg(\d+)_.*_$/);
        return RegExp.$1;
    },

    getGroupDiv: function(o) {
        var obj = jQuery(o);
        return obj.closest('.flcf-block');
    },

    objtype: function(o) {
        return Object.prototype.toString.call(o).slice(8, -1);
    }
};
