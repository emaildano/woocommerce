/**
 * External dependencies
 */
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import { CategoryMetabox } from './category-metabox';
import { getSelectedCategoryData } from './category-handlers';
import './style.scss';

const metaboxContainer = document.querySelector(
	'#taxonomy-product_cat-metabox'
);
const initialSelected = getSelectedCategoryData(
	metaboxContainer.parentElement
);
render(
	<CategoryMetabox initialSelected={ initialSelected } />,
	metaboxContainer
);