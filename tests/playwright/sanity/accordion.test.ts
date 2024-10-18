import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

test( 'Accordion', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	test.info().annotations.push( { type: 'issue', description: 'known-issue' } );
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests ),
		editor = await wpAdmin.openNewPage();

	// Act.
	await editor.addWidget( 'accordion' );

	// Assert
	await editor.togglePreviewMode();
	await page.pause();
	expect( await editor.getPreviewFrame()
		.locator( '.elementor-widget-wrap > .elementor-background-overlay' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'accordion.jpeg' );
} );
