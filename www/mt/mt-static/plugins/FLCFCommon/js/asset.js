function flcfInsertCustomFieldAsset(html, id, preview_html, asset_id) {
//console.log('asset_insert', html, id, preview_html, asset_id);
//return;
    if (!asset_id) {
        asset_id = '';
    }
    jQuery('#' + id).val(asset_id);
    if (!preview_html) {
        preview_html = html ? html : '';
     }
    try {
        var enc = document.createElement('div');
        enc.innerHTML = preview_html;
        var form = enc.getElementsByTagName('form')[0];
        jQuery('#' + id + '_preview').html(form ? form.innerHTML : preview_html);
    } catch(e) { 
        log.error(e);
    };

    var remove_button = jQuery('#' + id + '_remove_asset');
    if (remove_button && html) {
        remove_button.removeClass('hidden');
    }
    else if (remove_button) {
        remove_button.addClass('hidden');
    }
}
