Users may find it difficult to manage indexes, aliases and templates on Opensearch Dashboard by using APIs. There are restrictions and relation-binding stuff, like adding aliases to indexes, simulating an index template by its name and so on in the before. And now, we are excited to announce that the cluster operations have been largely simplified with index management UI enhancements on Opensearch Dashboard v2.5:

### 1. Visual editor for index mappings with nested tree editor.
[TODO](A screen shot)
It is more complicated to build a JSON when it comes to index mappings, which has multiple nested layers and properties. To simplify that, A visual editor is provided with nested properties editable capability. Users can add properties by clicking the operation buttons and see what the mappings will be like by switching to JSON editor.

### 2. Simulate index by index name.

[TODO](A screen shot)
It is hard to indicate what the index will be like considering the existing templates. To solve that, we will try to find if the index name matches any template every time users change the index name and merge what users manually input with what the matching template contains. What you see is what the index you get.

### 3. Edit settings by JSON editor and diff mode.

[TODO](A screen shot)
The new index operation UI provides a visual editor and a JSON editor in case the visual editor does not support all the fields. Further more, we provide editor with diff mode so users can see what changes they have made comparing the existing index, ensure no mistake will be made.

### 4. One click to manage aliases on indexes.

[TODO](A screen shot)
It is easy to see what aliases an index contains while hard to see how many indexes an aliases points to by API. The Aliases page give you the result grouping by alias. Moreover, users have to use alias actions to add/remove indexes behind an alias and manually type the indexes, which is easy to raise faults. By using the Admin UI, it will be much easier to attach/detach indexes from an alias and the alias actions will be automatically generated.

### 5. Others

Indexes, aliases and templates are all enhanced with CRUD operations in GUI, 

# In the end

If you have any feedback or suggestions, please feel free to comment on [TODO add links for feedback]
