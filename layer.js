import Events from 'events';
import * as Utils from 'utils';
import { ZINDEX } from './lib/z-index';
import { BACKDROP } from './lib/backdrop';

function Layer() {

}

Layer.ZINDEX = ZINDEX;
Layer.BACKDROP = BACKDROP;

Utils.inherits(Layer, Events, {

});
