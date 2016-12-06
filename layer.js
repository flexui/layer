import * as Utils from '../utils/util';
import Events from '../events/events';
import { ZINDEX } from './lib/z-index';
import { BACKDROP } from './lib/backdrop';

function Layer() {

}

Layer.ZINDEX = ZINDEX;
Layer.BACKDROP = BACKDROP;

Utils.inherits(Layer, Events, {

});
