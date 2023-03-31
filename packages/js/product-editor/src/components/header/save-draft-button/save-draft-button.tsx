/**
 * External dependencies
 */
import { Product } from '@woocommerce/data';
import { Button, Icon } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { check } from '@wordpress/icons';
import { createElement, Fragment } from '@wordpress/element';
import { MouseEvent, ReactNode } from 'react';

export function SaveDraftButton( {
	productId,
	disabled,
	onClick,
	onSaveSuccess,
	onSaveError,
	...props
}: Omit< Button.ButtonProps, 'aria-disabled' | 'variant' | 'children' > & {
	productId: number;
	onSaveSuccess?( product: Product ): void;
	onSaveError?( error: Error ): void;
} ) {
	const { productStatus, hasEdits } = useSelect(
		( select ) => {
			const { getEditedEntityRecord, hasEditsForEntityRecord } =
				select( 'core' );

			const product = getEditedEntityRecord< Product | undefined >(
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

	const { editEntityRecord, saveEditedEntityRecord } = useDispatch( 'core' );

	async function handleClick( event: MouseEvent< HTMLButtonElement > ) {
		if ( onClick ) {
			onClick( event );
		}

		try {
			await editEntityRecord( 'postType', 'product', productId, {
				status: 'draft',
			} );
			const publishedProduct = await saveEditedEntityRecord< Product >(
				'postType',
				'product',
				productId
			);

			if ( onSaveSuccess ) {
				onSaveSuccess( publishedProduct );
			}
		} catch ( error ) {
			if ( onSaveError ) {
				onSaveError( error as Error );
			}
		}
	}

	let children: ReactNode;
	if ( productStatus === 'publish' ) {
		children = __( 'Switch to draft', 'woocommerce' );
	} else if ( hasEdits ) {
		children = __( 'Save draft', 'woocommerce' );
	} else {
		children = (
			<>
				<Icon icon={ check } />
				{ __( 'Saved', 'woocommerce' ) }
			</>
		);
	}

	return (
		<Button
			{ ...props }
			aria-disabled={
				disabled || ( productStatus !== 'publish' && ! hasEdits )
			}
			variant="tertiary"
			onClick={ handleClick }
		>
			{ children }
		</Button>
	);
}
