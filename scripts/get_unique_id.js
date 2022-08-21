globalThis.globally_unique = 0;

function get_unique_id()
{
	return globally_unique++;
}