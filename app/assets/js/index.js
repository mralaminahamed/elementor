import ReactUtils from 'elementor-utils/react';
import App from './app';
import ImportExport from '../../modules/import-export/assets/js/module';
import ImportExportCustomization from '../../modules/import-export-customization/assets/js/module';
import KitLibrary from '../../modules/kit-library/assets/js/module';
import Onboarding from '../../modules/onboarding/assets/js/module';
import { Module as SiteEditor } from '@elementor/site-editor';

import AppProvider from './app-context';

new ImportExport();
new KitLibrary();
new SiteEditor();
new Onboarding();

if ( elementorCommon?.config?.experimentalFeatures?.[ 'import-export-customization' ] ) {
	new ImportExportCustomization();
}

const AppWrapper = React.Fragment;

ReactUtils.render( (
	<AppWrapper>
		<AppProvider>
			<App />
		</AppProvider>
	</AppWrapper>
), document.getElementById( 'e-app' ) );
