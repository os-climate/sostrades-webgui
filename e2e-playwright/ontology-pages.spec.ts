import { test } from '@playwright/test';
import { baseOntologyModels } from './base/base-ontology-models-page';
import { baseOntologyParameters } from './base/base-ontology-parameters-page';
import { baseOntologyProcesses } from './base/base-ontology-processes-page';


/**
 * Test check models from ontology.
 */
test('Test Ontology -> Test_ontology_models_page', async ({ page }) => {
    const modelName = 'Core Architecture Builder Model';
    const processName = 'Generic Value Assessment Grid Search Sensitivity Process';
    const modelCodeRepository = 'sostrades-core';
    const processCodeRepository = 'Generic Value Assessment Repository';
    const ParameterName = 'Debug Mode';
    const ParameterId = 'debug_mode';

    // Ontology model to process
    await baseOntologyModels(page, modelName, modelCodeRepository, processName, processCodeRepository, true, ParameterName, ParameterId);

    // Ontology model to parameter
    await baseOntologyModels(page, modelName, modelCodeRepository, processName, processCodeRepository, false, ParameterName, ParameterId);


});

/**
 * Test check processes from ontology.
 */
test('Test Ontology -> Test_ontology_process_page', async ({ page }) => {
    const modelName = 'Coupling';
    const modelId = 'sos_trades_core.execution_engine.sos_coupling';
    const processName = 'Generic Value Assessment Process';
    const processId = 'value_assessment.sos_processes.generic_value_assessment';
    const processCodeRepository = 'Generic Value Assessment Repository';

    await baseOntologyProcesses(page, processId, processName, processCodeRepository, modelId, modelName);
});

/**
 * Test check parameters from ontology.
 */
test('Test Ontology -> Test_ontology_parameter_page', async ({ page }) => {
    const modelName = 'Core Architecture Builder Model';
    const modelCodeRepository = 'sostrades-core';
    const parameterLabel = 'Aircraft List';
    await baseOntologyParameters(page, parameterLabel, modelName, modelCodeRepository);
});
