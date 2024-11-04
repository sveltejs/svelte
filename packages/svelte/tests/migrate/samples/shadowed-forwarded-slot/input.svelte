{#if $$slots.label}
	<slot name="label" />
{/if}
<MyInput>
	<slot name="label" slot="label"/>
</MyInput>
<MyInput>
	<div slot="label">
		<MyComponent>
			<div slot="label">
				<slot name="label" />
			</div>
		</MyComponent>
	</div>
</MyInput>