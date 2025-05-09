import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import EditorSelectors from '../../../../../selectors/editor-selectors';

const BUTTON_CLASSES = {
	active: /e-onboarding__button-action/,
	disabled: /e-onboarding__button--disabled/,
};

// Unskip: ED-18816 - Refactor onboarding test
test.describe.skip( 'On boarding @onBoarding', async () => {
	let originalActiveTheme: string;
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		originalActiveTheme = await wpAdmin.getActiveTheme();
		await wpAdmin.activateTheme( 'twentytwentyfive' );
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.activateTheme( originalActiveTheme );
	} );

	/**
	 *  Test that the "Upgrade" popover appears when overing over the "Upgrade" button.
	 */
	test( 'Onboarding Upgrade Popover', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );

		const goProHeaderButton = page.locator( '#eps-app-header-btn-go-pro' );

		await goProHeaderButton.hover();

		const goProPopover = page.locator( '.e-app__popover.e-onboarding__go-pro' );

		await expect( goProPopover ).toBeVisible();
	} );

	/**
	 * Test the first onboarding page - Test that the Action button at the bottom shows the correct "Create my account"
	 * text, And that clicking on it opens the popup to create an account in my.elementor.com
	 */
	test( 'Onboarding Create Account Popup Open', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );

		const ctaButton = await page.waitForSelector( 'a.e-onboarding__button-action' );

		expect( await ctaButton.innerText() ).toBe( 'Create my account' );

		const [ popup ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
			page.click( 'a.e-onboarding__button-action' ),
		] );

		await popup.waitForLoadState( 'domcontentloaded' );

		expect( popup.url() ).toContain( 'my.elementor.com/signup' );

		const signupForm = popup.locator( '[data-test="signup-form"]' );

		// Check that the popup opens the Elementor Connect screen.
		await expect( signupForm ).toBeVisible();

		await popup.close();
	} );

	/**
	 * Test the "Skip" button - to make sure it skips to the next step.
	 */
	test( 'Onboarding Skip to Hello Theme Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding' );
		await page.waitForLoadState( 'networkidle' );

		const skipButton = await page.waitForSelector( 'text=Skip' );

		await skipButton.click();

		await expect( page.locator( EditorSelectors.onboarding.screenTitle ) ).toHaveText( 'Every site starts with a theme.' );
	} );

	/**
	 * Test the Site Name page
	 *
	 * 1. The 'Next' button should be disabled if the site name input is empty, and become enabled again when a text is
	 * filled.
	 * 2. Clicking on 'Skip' should take the user to the Site Logo screen
	 */
	test( 'Onboarding Site Name Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/siteName' );

		await page.fill( 'input[type="text"]', '' );

		const nextButton = page.locator( 'text=Next' );

		await expect( nextButton ).toHaveClass( BUTTON_CLASSES.disabled );

		await page.fill( 'input[type="text"]', 'Test' );

		await expect( nextButton ).toHaveClass( BUTTON_CLASSES.active );

		await page.locator( EditorSelectors.onboarding.skipButton ).click();

		const pageTitle = page.locator( EditorSelectors.onboarding.screenTitle );
		await expect( pageTitle ).toHaveText( 'Have a logo? Add it here.' );
	} );

	/**
	 * Test the Site Logo page
	 *
	 * 1. The 'Next' button should be disabled if there is no image selected, and become enabled again when an image is
	 * selected.
	 * 2. Clicking on 'Skip' should take the user to the Good to Go screen
	 */

	test( 'Onboarding Site Logo Page', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/siteLogo' );

		const nextButton = page.locator( 'text=Next' );
		const removeButton = page.locator( EditorSelectors.onboarding.removeLogoButton );
		const skipButton = page.locator( EditorSelectors.onboarding.skipButton );

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-expect-error
		const siteLogoId = await page.evaluate( () => elementorAppConfig.onboarding.siteLogo.id );

		if ( siteLogoId ) {
			await expect( nextButton ).toHaveClass( BUTTON_CLASSES.active );
			await removeButton.click();
		}

		await expect( nextButton ).toHaveClass( BUTTON_CLASSES.disabled );
		await skipButton.click();

		await expect( page.locator( EditorSelectors.onboarding.screenTitle ) ).toHaveText( 'Welcome aboard! What\'s next?' );
	} );

	/**
	 * In the Good to Go page - tests that clicking on the Kit Library card/button navigates the user to the Kit Library.
	 */
	test( 'Onboarding Good to Go Page - Open Kit Library', async ( { page } ) => {
		await page.goto( '/wp-admin/admin.php?page=elementor-app#onboarding/goodToGo' );

		const nextButton = page.locator( '.e-onboarding__cards-grid > a:nth-child(2)' );

		await nextButton.click();

		const kitLibraryTitle = page.locator( 'text=Kit Library' );

		await expect( kitLibraryTitle ).toBeVisible();
	} );
} );

test.describe( 'Onboarding @onBoarding', async () => {
	const chooseFeaturesUrl = '/wp-admin/admin.php?page=elementor-app#onboarding/chooseFeatures';

	test( 'Onboarding Choose Features page', async ( { page } ) => {
		await page.goto( chooseFeaturesUrl );

		const chooseFeaturesScreen = page.locator( '.e-onboarding__page-chooseFeatures' ),
			upgradeNowBtn = page.locator( EditorSelectors.onboarding.upgradeButton ),
			tierLocator = page.locator( '.e-onboarding__choose-features-section__message strong' ),
			tiers = {
				advanced: 'Advanced',
				essential: 'Essential',
			};

		await upgradeNowBtn.waitFor();

		await expect.soft( chooseFeaturesScreen ).toHaveScreenshot( 'chooseFeaturesScreen.png' );

		await test.step( 'Check that Upgrade Now button is disabled', async () => {
			await expect( upgradeNowBtn ).toHaveClass( BUTTON_CLASSES.disabled );
		} );

		await test.step( 'Check that tier changes to Essential when checking an Essential item', async () => {
			await page.locator( '#essential-2' ).check();
			await expect( tierLocator ).toHaveText( tiers.essential );
		} );

		await test.step( 'Check that Upgrade Now button is not disabled', async () => {
			await expect( upgradeNowBtn ).not.toHaveClass( BUTTON_CLASSES.disabled );
		} );

		await test.step( 'Check that tier changes to Advanced when checking an Advanced item', async () => {
			await page.locator( '#advanced-1' ).check();
			await expect( tierLocator ).toHaveText( tiers.advanced );
		} );

		await test.step( 'Check that tier changes to Essential when unchecking all Advanced items but an Essential Item Is checked.', async () => {
			await page.locator( '#advanced-1' ).uncheck();
			await expect( tierLocator ).toHaveText( tiers.essential );
		} );

		await test.step( 'Check that is not visible when unchecking all items', async () => {
			await page.locator( '#essential-2' ).uncheck();
			await expect( tierLocator ).not.toBeVisible();
		} );

		await test.step( 'Check that tier changes to Advanced when checking only and Advanced item', async () => {
			await page.locator( '#advanced-1' ).check();
			await expect( tierLocator ).toHaveText( tiers.advanced );
		} );
	} );

	test( 'Onboarding Choose Features page - Upgrade button', async ( { page } ) => {
		await page.goto( chooseFeaturesUrl );

		const upgradeNowBtn = page.locator( EditorSelectors.onboarding.upgradeButton );

		await upgradeNowBtn.waitFor();

		await test.step( 'Activate upgrade button', async () => {
			await page.locator( `${ EditorSelectors.onboarding.features.essential }-0` ).check();
			await expect( upgradeNowBtn ).not.toHaveClass( BUTTON_CLASSES.disabled );
		} );

		await test.step( 'Check that Upgrade button opens elementor.com store', async () => {
			const [ newTab ] = await Promise.all( [
				page.waitForEvent( 'popup' ),
				upgradeNowBtn.click(),
			] );

			expect( newTab.url() ).toContain( 'elementor.com' );
		} );

		await test.step( 'Check that step was changed to Good to Go', async () => {
			expect( page.url() ).toContain( 'onboarding/goodToGo' );
			await expect( page.locator( EditorSelectors.onboarding.progressBar.completedItem ) ).toContainText( 'Choose Features' );
			await expect( page.locator( EditorSelectors.onboarding.screenTitle ) ).toHaveText( 'Welcome aboard! What\'s next?' );
		} );
	} );

	test( 'Onboarding Choose Features page - Skip button', async ( { page } ) => {
		await page.goto( chooseFeaturesUrl );

		const skipButton = page.locator( EditorSelectors.onboarding.skipButton );

		await skipButton.waitFor();

		await test.step( 'Check that Skip button leads to the Good to Go screen', async () => {
			await skipButton.click();
			expect( page.url() ).toContain( 'onboarding/goodToGo' );
			await expect( page.locator( EditorSelectors.onboarding.progressBar.skippedItem ) ).toContainText( 'Choose Features' );
			await expect( page.locator( EditorSelectors.onboarding.screenTitle ) ).toHaveText( 'Welcome aboard! What\'s next?' );
		} );
	} );
} );
