import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test.describe( 'Widget tests', () => {
	test( 'Widget Transform controls', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: true,
		} );

		// Arrange.
		const editor = await wpAdmin.openNewPage(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			widgetId = await editor.addWidget( 'heading', containerId ),
			widgetContainerSelector = '.elementor-edit-mode .elementor-element-' + widgetId;

		// Act.
		await editor.openPanelTab( 'advanced' );
		await editor.openSection( '_section_transform' );
		// Set rotation.
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_rotateZ_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_rotate_popover .elementor-control-popover-toggle-toggle-label' ).click();
		// Set scale.
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();
		await page.locator( '.elementor-control-_transform_scale_effect .elementor-control-input-wrapper input' ).fill( '2' );
		await page.locator( '.elementor-control-_transform_scale_popover .elementor-control-popover-toggle-toggle-label' ).click();

		// Assert.
		// Check rotate and scale value.
		await expect( editor.getPreviewFrame().locator( widgetContainerSelector ) ).toHaveCSS( '--e-transform-rotateZ', '2deg' );
		await expect( editor.getPreviewFrame().locator( widgetContainerSelector ) ).toHaveCSS( '--e-transform-scale', '2' );
	} );
} );
