import { useEffect, useState, useCallback} from "react";
import { json } from "@remix-run/node";
import {
  Page,
  BlockStack,
  Layout,
  Card,
  Text,
  Button,
  Modal,
  TextField,
  ResourceList,
  Avatar,
  ResourceItem,
} from "@shopify/polaris";
import { useActionData, useSubmit, useLoaderData } from "@remix-run/react";
import { getList, createList, updateList, deleteList } from "../models/list.server";

export const loader = async ({ request }) => {
  const { list } = await getList();
  return json({
    list: list,
  });
};

export const action = async ({ request }) => {
  const data = {...Object.fromEntries(await request.formData())};
  if (request.method == "POST") {
    const response = await createList(data);
    return json({
      newList: response.newList,
      status: response.status
    })
  }

  if (request.method == "PUT") {
    const response = await updateList(data);
    return json({
      deleteList: response.deleteList,
      status: response.status
    })
  }

  if (request.method == "DELETE") {
    const response = await deleteList(data);
    return json({
      deleteList: response.deleteList,
      status: response.status
    })
  }
}

export default function Index() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(0);
  const [action, setAction] = useState('create');
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const resourceName = {
    singular: 'item',
    plural: 'items',
  };

  const handleChange = useCallback(() => setActive(!active), [active]);

  const handleTitleChange = useCallback(
    (newValue) => setTitle(newValue),
    [],
  );

  const handleContentChange = useCallback(
    (newValue) => setContent(newValue),
    [],
  );

  const createItem = (action) => {
    if (action == 'create') {
      submit({ title: title, content: content }, { method: "post" });
    } else {
      submit({ id: selectedId, title: title, content: content }, { method: "put" });
    }
    setActive(false);
    setTitle('');
    setContent('');
  }

  const handleCreate = () => {
    handleChange();
    setAction('create');
  }

  const handleCancel = () => {
    setActive(false);
    setTitle('');
    setContent('');
  }

  const handleUpdate = (id, editTitle, editContent) => {
    setAction('edit');
    setSelectedId(id);
    setTitle(editTitle);
    setContent(editContent);
    handleChange();
  }

  const handleDelete = (id) => {
    if (id) {
      submit({ id: id }, { method: "delete" });
    } else {
      submit({ id: selectedItems }, { method: "delete" });
    }
  }

  const bulkActions = [
    {
      content: 'Delete',
      onAction: () => handleDelete(),
    },
  ];
  
  useEffect(() => {
    setItems(loaderData.list);
  }, [loaderData.list])
  
  function renderItem(item) {
    const {id, title, content} = item;
    const media = <Avatar customer size="md" name={title} />;

    return (
      <ResourceItem
        id={id}
        media={media}
        accessibilityLabel={`View details for ${title}`}
      >
        <Text variant="bodyMd" fontWeight="bold" as="h3">
          {title}
        </Text>
        <div>{content}</div>
        <div style={{ position: "absolute", right: 0, top: "17px", display: "flex", gap: "10px" }}>
          <Button onClick={() => handleUpdate(id, title, content)} primary>
            Edit
          </Button>
          <Button onClick={() => handleDelete(id)} primary>
            Delete
          </Button>
        </div>
      </ResourceItem>
    );
  }

  return (
    <Page>
      <ui-title-bar title="Todo List">
        <button variant="primary" onClick={handleCreate}>
          Create
        </button>
      </ui-title-bar>
      <Modal
          open={active}
          onClose={handleChange}
          title="Item"
          primaryAction={{
            content: action == 'create' ? 'Add' : "Save",
            onAction: () => createItem(action),
          }}
          secondaryActions={[
            {
              content: 'Cancel',
              onAction: handleCancel,
            },
          ]}
        >
        <Modal.Section>
          <div style={{ marginBottom: "10px" }}>
            <TextField
              label="Title"
              value={title}
              onChange={handleTitleChange}
              autoComplete="off"
            />
          </div>
          <TextField
            label="Content"
            value={content}
            onChange={handleContentChange}
            autoComplete="off"
          />
        </Modal.Section>
      </Modal>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <ResourceList
                resourceName={resourceName}
                items={items}
                bulkActions={bulkActions}
                renderItem={renderItem}
                selectedItems={selectedItems}
                onSelectionChange={setSelectedItems}
              />
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
