import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ImportCustomization from 'elementor/app/modules/import-export-customization/assets/js/import/pages/import-customization';
import eventsConfig from 'elementor/core/common/modules/events-manager/assets/js/events-config';

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockUseImportContext = jest.fn();

jest.mock( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context', () => ( {
	...jest.requireActual( 'elementor/app/modules/import-export-customization/assets/js/import/context/import-context' ),
	useImportContext: () => mockUseImportContext(),
} ) );

jest.mock( '@reach/router', () => ( {
	useNavigate: () => mockNavigate,
} ) );

const mockSendPageViewsWebsiteTemplates = jest.fn();
jest.mock( 'elementor/app/assets/js/event-track/apps-event-tracking', () => ( {
	AppsEventTracking: {
		sendPageViewsWebsiteTemplates: ( ...args ) => mockSendPageViewsWebsiteTemplates( ...args ),
	},
} ) );

describe( 'ImportCustomization Page', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.resetAllMocks();
		global.elementorAppConfig = { base_url: 'http://localhost' };
		global.elementorCommon = {
			eventsManager: {
				config: eventsConfig,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorAppConfig;
		delete global.elementorCommon;
	} );

	function setup( { isCustomizing = true, isProcessing = false } = {} ) {
		mockUseImportContext.mockReturnValue( {
			isCustomizing,
			isProcessing,
			dispatch: mockDispatch,
			data: { includes: [], customization: {} },
		} );
	}

	it( 'renders main content and ImportKitContent', async () => {
		// Arrange
		setup();
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( screen.getByText( 'Select which parts you want to apply' ) ).toBeTruthy();
		expect( screen.getByText( /These are the templates/ ) ).toBeTruthy();
		expect( screen.getByTestId( 'import-kit-parts-content' ) ).toBeTruthy();

		await waitFor( () => expect( mockSendPageViewsWebsiteTemplates ).toHaveBeenCalledWith( 'kit_import_customization' ) );
	} );

	it( 'dispatches SET_IMPORT_STATUS PENDING when Back is clicked', () => {
		// Arrange
		setup();
		render( <ImportCustomization /> );
		const backButton = screen.getByTestId( 'import-back-button' );
		// Act
		fireEvent.click( backButton );
		// Assert
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'PENDING' } );
	} );

	it( 'dispatches SET_IMPORT_STATUS IMPORTING and navigates when Import and apply is clicked', () => {
		// Arrange
		setup();
		render( <ImportCustomization /> );
		const importButton = screen.getByTestId( 'import-apply-button' );
		// Act
		fireEvent.click( importButton );
		// Assert
		expect( importButton.textContent ).toBe( 'Import and apply' );
		expect( mockDispatch ).toHaveBeenCalledWith( { type: 'SET_IMPORT_STATUS', payload: 'IMPORTING' } );
		expect( mockNavigate ).toHaveBeenCalledWith( 'import-customization/process' );
	} );

	it( 'navigates to process if isProcessing is true', () => {
		// Arrange
		setup( { isProcessing: true } );
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import-customization/process' );
	} );

	it( 'navigates to import-customization if isCustomizing is false', () => {
		// Arrange
		setup( { isCustomizing: false } );
		// Act
		render( <ImportCustomization /> );
		// Assert
		expect( mockNavigate ).toHaveBeenCalledWith( 'import-customization', { replace: true } );
	} );
} );
