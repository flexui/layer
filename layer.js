import Events from '@flexui/events';
import * as Utils from '@flexui/utils';
import { ZINDEX } from './lib/z-index';
import { BACKDROP } from './lib/backdrop';

function Layer() {

}

Layer.ZINDEX = ZINDEX;
Layer.BACKDROP = BACKDROP;

Utils.inherits(Layer, Events, {

});
