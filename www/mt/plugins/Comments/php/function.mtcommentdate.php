<?php
# Movable Type (r) (C) Six Apart Ltd. All Rights Reserved.
# This code cannot be redistributed without permission from www.sixapart.com.
# For more information, consult your Movable Type license.
#
# $Id$

function smarty_function_mtcommentdate($args, &$ctx) {
    $c = $ctx->stash('comment');
    $args['ts'] = $c->comment_created_on;
    return $ctx->_hdlr_date($args, $ctx);
}
?>
