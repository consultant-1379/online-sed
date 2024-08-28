import { expect } from "vitest";
import { mount } from '@vue/test-utils';
import model from '../../src/model';
import KubernetesToleration from '../../src/components/KubernetesToleration.vue';


describe('KubernetesToleration', () => {
  const createWrapper = (tolerations, sedParam) => {
    return mount(KubernetesToleration, {
      props: {
        tolerations,
        sedParam,
        model: {
          currentQuestion: { key: 'yourKey' },
          response: {}
        }},
    });
  };
  const SED_PARAM = {
    key: "tolerations",
    tolerationInfo: {
      key: {
        required: true,
        description: 'This is a string definition',
        type: 'string',
        validationPattern: '^\\w+$',
      },
      operator: {
        required: true,
        description: 'This must be a valid Kubernetes Toleration operator.',
        type: 'select',
        options: ['Equal', 'Exists'],
        validationPattern: '^\\w+$',
      },
      effect: {
        required: true,
        description: 'This must be a valid Kubernetes Toleration Effect.',
        type: 'select',
        options: ['NoSchedule', 'PreferNoSchedule', 'NoExecute'],
        validationPattern: '^\\w+$',
      },
      value: {
        required: true,
        description: 'This is a string definition',
        type: 'string',
        validationPattern: '^\\w+$',
      },
      tolerationSeconds: {
        description: 'This is a string definition',
        type: 'string',
        validationPattern: '^\\w+$',
      }
    }
  };

  test('selects are initialized and localToleration is updated', async () => {
    const wrapper = createWrapper([{ key: 'key1', operator: 'Equal', effect: 'NoSchedule', value: 'val1'}], SED_PARAM);
    await wrapper.vm.$nextTick();
    await wrapper.vm.addToleration();
    await wrapper.vm.initializeSelects();
    expect(wrapper.vm.localTolerations).to.have.length(2);
  });

  test('renders no record message when localTolerations is empty', async () => {
    const wrapper = createWrapper([], SED_PARAM);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#tolerationNoRec').exists()).to.be.true;
  });

  test('renders tolerations table when localTolerations is not empty', async () => {
    const tolerations = [{ key: 'key1', operator: 'Equal', effect: 'NoSchedule', tolerationSeconds: 0 }];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#tolerationsTable').exists()).to.be.true;
  });

  test('adds toleration when addToleration is called', async () => {
    const wrapper = createWrapper([{ key: 'key1', operator: 'Equal', effect: 'NoSchedule', value: 'val1'}], SED_PARAM);
    await wrapper.vm.$nextTick();
    await wrapper.vm.addToleration();
    expect(wrapper.vm.localTolerations).to.have.length(2);
  });

  test('removes toleration when removeToleration is called', async () => {
    const tolerations = [{ key: 'key1', operator: 'Equal', effect: 'NoSchedule', value: 'val1'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.localTolerations).toHaveLength(1);
    await wrapper.find('.btn.primary').trigger('click');
    expect(wrapper.vm.localTolerations).to.have.length(0);
  });

  test('saves tolerations when save is called with valid toleration', async () => {
    const tolerations = [{ key: 'key1', operator: 'Equal', effect: 'NoSchedule', value: 'val1'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    model.initializedK8sTolerationSelects = [];
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    const expectedResponse = {
      tolerations: [
        {
          effect: "NoSchedule",
          key: "key1",
          operator: "Equal",
          value: "val1",
        }
      ]
    };
    expect(model.response).to.deep.equal(expectedResponse)
  });

  test('saves tolerations when save is called with valid toleration operator set to Exists', async () => {
    const tolerations = [{ key: 'key1', operator: 'Exists', effect: 'NoSchedule', tolerationSeconds: 5000 }];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    model.initializedK8sTolerationSelects = [];
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    const expectedResponse = {
      tolerations: [
        {
          effect: "NoSchedule",
          key: "key1",
          operator: "Exists",
          tolerationSeconds: 5000
        }
      ]
    };
    expect(model.response).to.deep.equal(expectedResponse)
  });

  test('does not save tolerations when save is called with invalid toleration', async () => {
    const wrapper = createWrapper([{ key: 'invalid 123' }], SED_PARAM);
    model.response = {}
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    expect(model.response).to.deep.equal({})
  });

  test('validates toleration entry based on pattern', async () => {
    const wrapper = createWrapper([{ key: 'invalid 123' }], SED_PARAM);
    await wrapper.vm.$nextTick();
    expect(wrapper.find('#error-message-toleration-key-0').exists()).to.be.true;
    expect(wrapper.find('#error-message-toleration-key-0').isVisible()).to.be.true;
  });

  test('does not save tolerations when save is called with invalid toleration without key', async () => {
    const tolerations = [{operator: 'Exists', effect: 'NoSchedule'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    expect(model.response).to.deep.equal({})
  });

  test('does not save tolerations when save is called with invalid toleration without value when operator is equal', async () => {
    const tolerations = [{key: 'key1', operator: 'Equal', effect: 'NoSchedule'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    expect(model.response).to.deep.equal({})
  });

  test('close set variables correctly', async () => {
    const tolerations = [{ key: 'key1', operator: 'Exists', effect: 'NoSchedule'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    await wrapper.vm.$nextTick();
    await wrapper.vm.save();
    await wrapper.vm.close();
    expect(model.response.tolerations).to.be.empty;
    expect(model.showTolerationDialog).to.be.false;
  });

  test('updates localTolerations correctly for a non-operator type', () => {
    const select = {value: ['Equals']};
    const selectDOM = {id: 'test-operator-0'};
    const tolerations = [{key: 'key1', operator: 'Equals', effect: 'NoSchedule', value: "someValue"}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    wrapper.vm.handleLocalTolerationChanges(select, selectDOM);
    const expectedResponse = [
      {
        effect: "NoSchedule",
        key: "key1",
        operator: "Equals",
        value: "someValue"
      }
    ];
    expect(wrapper.vm.localTolerations).to.deep.equal(expectedResponse);
  });

  test('updates localTolerations correctly for an operator type Exists', () => {
    const select = { value: ['Exists'] };
    const selectDOM = { id: 'test-operator-0' };
    const tolerations = [{key: 'key1', operator: 'Exists', effect: 'NoSchedule'}];
    const wrapper = createWrapper(tolerations, SED_PARAM);
    wrapper.vm.handleLocalTolerationChanges(select, selectDOM);
    const expectedResponse = [
      {
        effect: "NoSchedule",
        key: "key1",
        operator: "Exists"
      }
    ];
    expect(wrapper.vm.localTolerations).to.deep.equal(expectedResponse);
  });
});
