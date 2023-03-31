/**
 * External dependencies
 */
import { Product } from '@woocommerce/data';
import { Button } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { MouseEvent } from 'react';

export function PublishButton( {
	productId,
	disabled,
	onClick,
	onPublishSuccess,
	onPublishError,
	...props
}: Omit< Button.ButtonProps, 'aria-disabled' | 'variant' | 'children' > & {
	productId: number;
	onPublishSuccess?( product: Product ): void;
	onPublishError?( error: Error ): void;
} ) {
	const { productStatus, hasEdits } = useSelect(
		( select ) => {
			const { getEditedEntityRecord, hasEditsForEntityRecord } =
				select( 'core' );

			const product = getEditedEntityRecord< Product >(
				'postType',
				'product',
				productId
			);

			return {
				productStatus: product?.status,
				hasEdits: hasEditsForEntityRecord< boolean >(
					'postType',
					'product',
					productId
				),
			};
		},
		[ productId ]
	);

	const isCreating = ( productStatus as string ) === 'auto-draft';

	const { editEntityRecord, saveEditedEntityRecord } = useDispatch( 'core' );

	async function handleClick( event: MouseEvent< HTMLButtonElement > ) {
		if ( onClick ) {
			onClick( event );
		}

		try {
			// The publish button click not only change the status of the product
			// but also save all the pending changes. So even if the status is
			// publish it's possible to save the product too.
			if ( productStatus !== 'publish' ) {
				await editEntityRecord( 'postType', 'product', productId, {
					status: 'publish',
				} );
			}

			const publishedProduct = await saveEditedEntityRecord< Product >(
				'postType',
				'product',
				productId
			);

			if ( onPublishSuccess ) {
				onPublishSuccess( publishedProduct );
			}
		} catch ( error ) {
			if ( onPublishError ) {
				onPublishError( error as Error );
			}
		}
	}

	return (
		<Button
			{ ...props }
			aria-disabled={
				disabled || ( productStatus === 'publish' && ! hasEdits )
			}
			variant="primary"
			onClick={ handleClick }
		>
			{ isCreating
				? __( 'Add', 'woocommerce' )
				: __( 'Save', 'woocommerce' ) }
		</Button>
	);
}
