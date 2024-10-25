import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';

const isCI = 'true' === process.env.CI;
const isScheduledEvent = 'schedule' === process.env.GITHUB_EVENT_NAME;

const testOptions = isCI ? { tag: '@known-issue' } : {};

test( 'Accordion', testOptions, async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	// Act.
	await editor.addWidget( 'accordion' );

	// Assert.
	expect( await editor.getPreviewFrame()
		.locator( '.elementor-widget-wrap > .elementor-background-overlay' )
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( 'accordion.jpeg' );
} );
